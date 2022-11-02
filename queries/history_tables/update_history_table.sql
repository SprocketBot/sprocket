CREATE OR REPLACE function update_history_table() returns trigger
    language plpgsql
as
$$
DECLARE
    t               timestamptz;
    updateStatement text;
    insertStatement text;
BEGIN
    -- Grab a timestamp to keep it consistent
    t := CURRENT_TIMESTAMP;

    -- If we are not inserting a row; update the currently accurate row to close the applicable period
    IF TG_OP != 'INSERT' AND old.id IS NOT NULL THEN
        updateStatement := FORMAT(
                'UPDATE history.%I SET applicable_period = tsrange(lower(applicable_period), ''%I'', ''[]'') WHERE "id" = %L AND upper(applicable_period) is null',
                TG_TABLE_NAME || '_history',
                t,
                old.id
            );
        -- Debug Helper
        -- RAISE NOTICE '%', updateStatement;
        EXECUTE updateStatement;
    END IF;

    -- Insert Next History Row
    IF tg_op != 'DELETE' AND new.id IS NOT NULL THEN
        -- First we need to get all the columns
        WITH all_keys AS (SELECT column_name AS k
                          FROM information_schema.columns
                          WHERE table_name = tg_table_name),
             -- select_cols/insert_cols exist to clean up the final query a little bit
             select_cols AS (SELECT STRING_AGG(DISTINCT CONCAT('', '(n.x)."', k, '"'), ', ') AS cs FROM all_keys),
             insert_cols AS (SELECT CONCAT(STRING_AGG(DISTINCT '"' || k || '"', ', '), ', applicable_period') AS ci
                             FROM all_keys)
             -- Build the insert query, using explicit column references
        SELECT FORMAT(CONCAT('INSERT INTO history.', tg_table_name, '_history (', ci, ') SELECT ', cs, ', ''[',
                             CURRENT_TIMESTAMP, ',]''::tsrange FROM (VALUES (%L::', tg_table_name, ')) AS n (x)'), new)
        INTO insertStatement
        FROM insert_cols,
             select_cols;
        -- Debug Helper
        -- RAISE NOTICE '%', insertStatement;

        -- Execute
        EXECUTE insertStatement;
    END IF;

    -- Ensure we return the correct values
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;