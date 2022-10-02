import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditingFunctions1658698707748 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
        await queryRunner.query(`

CREATE OR REPLACE FUNCTION create_history_table(target_table text, build_index boolean default true)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$body$
BEGIN
    -- Create history table
    CREATE SCHEMA IF NOT EXISTS history;

    -- Build the history table
    EXECUTE FORMAT(
            'CREATE TABLE IF NOT EXISTS history.%I (
                LIKE %I,
                applicable_period tsrange,
                history_id uuid default uuid_generate_v4(),
                CONSTRAINT %I PRIMARY KEY (history_id)
            )',
            target_table || '_history',
            target_table,
            target_table || '_history_pk'
        );

    IF build_index THEN
        EXECUTE FORMAT(
                'CREATE INDEX %I ON history.%I USING GIST (applicable_period)',
                target_table || '_history_tsrange_idx',
                target_table || '_history'
            );
    END IF;

    -- Drop any old trigger matching this name
    EXECUTE FORMAT(
            'DROP TRIGGER IF EXISTS %I ON %I',
            target_table || '_history_trigger',
            target_table
        );

    -- Create a new trigger that executes the update function
    EXECUTE FORMAT('
        CREATE TRIGGER %I
        BEFORE INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_history_table()',
                   target_table || '_history_trigger',
                   target_table
        );
END;
$body$;
`);
        await queryRunner.query(`
--
-- Update History Table Function
-- Example Usage -> (You don't, create_history_table does)
--

CREATE OR REPLACE FUNCTION update_history_table() RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    t                TIMESTAMPTZ;
    insert_statement TEXT;
BEGIN
    -- Grab a timestamp to keep it consistent
    t := CURRENT_TIMESTAMP;

    -- If we are not inserting a row; update the currently accurate row to close the applicable period
    IF tg_op != 'INSERT' AND old.id IS NOT NULL THEN
        EXECUTE FORMAT(
                'UPDATE history.%I_history SET applicable_period = tsrange(lower(applicable_period), ''%I'', ''[]'') WHERE "id" = %L AND upper(applicable_period) is null',
                tg_table_name,
                t,
                old.id
            );
    END IF;

    -- Insert Next History Row
    IF tg_op != 'DELETE' AND new.id IS NOT NULL THEN
        -- First we need to get all the columns
        WITH all_keys    AS (SELECT column_name AS k
                                 FROM information_schema.columns
                                 WHERE table_name = tg_table_name),
             -- select_cols/insert_cols exist to clean up the final query a little bit
             select_cols AS (SELECT STRING_AGG(DISTINCT CONCAT('', '(n.x).', k), ', ') AS cs FROM all_keys),
             insert_cols AS (SELECT CONCAT(STRING_AGG(DISTINCT k, ', '), ', applicable_period') AS ci FROM all_keys)
             -- Build the insert query, using explicit column references
        SELECT FORMAT(CONCAT('INSERT INTO history.', tg_table_name, '_history (', ci, ') SELECT ', cs, ', ''[',
                             CURRENT_TIMESTAMP, ',]''::tsrange FROM (VALUES (%L::', tg_table_name, ')) AS n (x)'), new)
            INTO insert_statement
            FROM insert_cols,
                 select_cols;

        -- Execute
        EXECUTE insert_statement;
    END IF;

    -- Ensure we return the correct values
    IF tg_op = 'DELETE' THEN
        RETURN old;
    ELSE
        RETURN new;
    END IF;
END;
$$;

`);
        await queryRunner.query(`
CREATE OR REPLACE FUNCTION remove_history_table(target_table text)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$body$
BEGIN
    EXECUTE FORMAT('DROP TABLE history.%I CASCADE', target_table || '_history');
END;
$body$;
`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION update_history_table() CASCADE`);
        await queryRunner.query(`DROP FUNCTION create_history_table(text, boolean) CASCADE`);
        await queryRunner.query(`DROP FUNCTION remove_history_table(text) CASCADE`);
    }

}
