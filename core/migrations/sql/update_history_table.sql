CREATE OR REPLACE FUNCTION public.update_history_table() RETURNS TRIGGER
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
            'UPDATE history.%s SET applicable_period = tsrange(lower(applicable_period), ''%s'', ''[]'') WHERE "id" = %L AND upper(applicable_period) is null',
            CONCAT(tg_table_name, '_history'),
            t,
            old.id
                );
    END IF;

    -- Insert Next History Row
    IF tg_op != 'DELETE' AND new.id IS NOT NULL THEN
        -- First we need to get all the columns
        WITH all_keys AS (SELECT column_name AS k
                          FROM information_schema.columns
                          WHERE table_name = tg_table_name
                            AND table_schema = tg_table_schema),
             -- select_cols/insert_cols exist to clean up the final query a little bit
             select_cols AS (SELECT STRING_AGG(DISTINCT CONCAT('', '(n.x).', CONCAT('"', k, '"')), ', ') AS cs
                             FROM all_keys),
             insert_cols AS (SELECT CONCAT(STRING_AGG(DISTINCT CONCAT('"', k, '"'), ', '), ', applicable_period') AS ci
                             FROM all_keys)
        -- Build the insert query, using explicit column references
        SELECT FORMAT(CONCAT('INSERT INTO history.', tg_table_name, '_history (', ci, ') SELECT ', cs, ', ''[',
                             CURRENT_TIMESTAMP, ',]''::tsrange FROM (VALUES (%L::"', tg_table_name, '")) AS n (x)'),
                      new)
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