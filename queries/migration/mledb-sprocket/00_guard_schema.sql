\set ON_ERROR_STOP on

CREATE SCHEMA IF NOT EXISTS migration_guard;

CREATE TABLE IF NOT EXISTS migration_guard.runs (
    run_id uuid PRIMARY KEY,
    description text NOT NULL DEFAULT '',
    git_sha text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    status text NOT NULL DEFAULT 'baseline-captured',
    notes text
);

CREATE TABLE IF NOT EXISTS migration_guard.sprocket_table_snapshots (
    run_id uuid NOT NULL REFERENCES migration_guard.runs(run_id),
    schema_name text NOT NULL,
    table_name text NOT NULL,
    row_count bigint NOT NULL,
    table_hash text NOT NULL,
    has_primary_key boolean NOT NULL,
    captured_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (run_id, schema_name, table_name)
);

CREATE TABLE IF NOT EXISTS migration_guard.sprocket_row_snapshots (
    run_id uuid NOT NULL REFERENCES migration_guard.runs(run_id),
    schema_name text NOT NULL,
    table_name text NOT NULL,
    primary_key jsonb NOT NULL,
    row_hash text NOT NULL,
    captured_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (run_id, schema_name, table_name, primary_key)
);

CREATE OR REPLACE FUNCTION migration_guard.capture_sprocket_baseline(
    p_run_id uuid,
    p_description text DEFAULT '',
    p_git_sha text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    tbl record;
    pk_expr text;
    pk_cols int;
    table_hash text;
    row_count bigint;
BEGIN
    INSERT INTO migration_guard.runs(run_id, description, git_sha)
    VALUES (p_run_id, p_description, p_git_sha)
    ON CONFLICT (run_id) DO UPDATE
        SET description = EXCLUDED.description,
            git_sha = EXCLUDED.git_sha,
            started_at = now(),
            completed_at = NULL,
            status = 'baseline-captured',
            notes = NULL;

    DELETE FROM migration_guard.sprocket_row_snapshots WHERE run_id = p_run_id;
    DELETE FROM migration_guard.sprocket_table_snapshots WHERE run_id = p_run_id;

    FOR tbl IN
        SELECT c.oid AS relation_oid, n.nspname AS schema_name, c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'sprocket'
          AND c.relkind IN ('r', 'p')
        ORDER BY n.nspname, c.relname
    LOOP
        EXECUTE format(
            'SELECT count(*)::bigint, md5(coalesce(string_agg(to_jsonb(t)::text, E''\n'' ORDER BY to_jsonb(t)::text), '''')) FROM %I.%I t',
            tbl.schema_name,
            tbl.table_name
        )
        INTO row_count, table_hash;

        SELECT count(*),
               string_agg(
                   format('%L, t.%I', a.attname, a.attname),
                   ', ' ORDER BY k.ordinality
               )
        INTO pk_cols, pk_expr
        FROM pg_index i
        JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ordinality) ON true
        JOIN pg_attribute a
          ON a.attrelid = i.indrelid
         AND a.attnum = k.attnum
        WHERE i.indrelid = tbl.relation_oid
          AND i.indisprimary;

        INSERT INTO migration_guard.sprocket_table_snapshots(
            run_id,
            schema_name,
            table_name,
            row_count,
            table_hash,
            has_primary_key
        )
        VALUES (
            p_run_id,
            tbl.schema_name,
            tbl.table_name,
            row_count,
            table_hash,
            pk_cols > 0
        );

        IF pk_cols > 0 THEN
            EXECUTE format(
                'INSERT INTO migration_guard.sprocket_row_snapshots(run_id, schema_name, table_name, primary_key, row_hash)
                 SELECT $1, %L, %L, jsonb_build_object(%s), md5(to_jsonb(t)::text)
                 FROM %I.%I t',
                tbl.schema_name,
                tbl.table_name,
                pk_expr,
                tbl.schema_name,
                tbl.table_name
            )
            USING p_run_id;
        END IF;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION migration_guard.validate_sprocket_baseline(p_run_id uuid)
RETURNS TABLE (
    issue_type text,
    schema_name text,
    table_name text,
    primary_key jsonb,
    before_hash text,
    after_hash text,
    detail text
)
LANGUAGE plpgsql
AS $$
DECLARE
    tbl record;
    pk_expr text;
BEGIN
    FOR tbl IN
        SELECT s.schema_name,
               s.table_name,
               c.oid AS relation_oid,
               s.has_primary_key,
               s.row_count,
               s.table_hash
        FROM migration_guard.sprocket_table_snapshots s
        JOIN pg_namespace n ON n.nspname = s.schema_name
        JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = s.table_name
        WHERE s.run_id = p_run_id
        ORDER BY s.schema_name, s.table_name
    LOOP
        IF tbl.has_primary_key THEN
            SELECT string_agg(
                       format('%L, t.%I', a.attname, a.attname),
                       ', ' ORDER BY k.ordinality
                   )
            INTO pk_expr
            FROM pg_index i
            JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ordinality) ON true
            JOIN pg_attribute a
              ON a.attrelid = i.indrelid
             AND a.attnum = k.attnum
            WHERE i.indrelid = tbl.relation_oid
              AND i.indisprimary;

            RETURN QUERY EXECUTE format(
                'WITH current_rows AS (
                     SELECT jsonb_build_object(%s) AS primary_key, md5(to_jsonb(t)::text) AS row_hash
                     FROM %I.%I t
                 )
                 SELECT ''deleted_preexisting_sprocket_row''::text,
                        s.schema_name,
                        s.table_name,
                        s.primary_key,
                        s.row_hash,
                        NULL::text,
                        ''row existed before migration and is now missing''::text
                 FROM migration_guard.sprocket_row_snapshots s
                 LEFT JOIN current_rows c ON c.primary_key = s.primary_key
                 WHERE s.run_id = $1
                   AND s.schema_name = %L
                   AND s.table_name = %L
                   AND c.primary_key IS NULL
                 UNION ALL
                 SELECT ''changed_preexisting_sprocket_row''::text,
                        s.schema_name,
                        s.table_name,
                        s.primary_key,
                        s.row_hash,
                        c.row_hash,
                        ''row existed before migration and its JSON hash changed''::text
                 FROM migration_guard.sprocket_row_snapshots s
                 JOIN current_rows c ON c.primary_key = s.primary_key
                 WHERE s.run_id = $1
                   AND s.schema_name = %L
                   AND s.table_name = %L
                   AND c.row_hash <> s.row_hash',
                pk_expr,
                tbl.schema_name,
                tbl.table_name,
                tbl.schema_name,
                tbl.table_name,
                tbl.schema_name,
                tbl.table_name
            )
            USING p_run_id;
        ELSE
            RETURN QUERY EXECUTE format(
                'WITH current_table AS (
                     SELECT count(*)::bigint AS row_count,
                            md5(coalesce(string_agg(to_jsonb(t)::text, E''\n'' ORDER BY to_jsonb(t)::text), '''')) AS table_hash
                     FROM %I.%I t
                 )
                 SELECT ''changed_sprocket_table_without_pk''::text,
                        %L::text,
                        %L::text,
                        NULL::jsonb,
                        $2::text,
                        c.table_hash,
                        format(''table has no primary key; baseline count/hash was %%s/%%s and current count/hash is %%s/%%s'', $1, $2, c.row_count, c.table_hash)::text
                 FROM current_table c
                 WHERE c.row_count <> $1 OR c.table_hash <> $2',
                tbl.schema_name,
                tbl.table_name,
                tbl.schema_name,
                tbl.table_name
            )
            USING tbl.row_count, tbl.table_hash;
        END IF;
    END LOOP;
END;
$$;
