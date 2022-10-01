CREATE FUNCTION update_history_table() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    t timestamptz;
BEGIN
    -- Grab a timestamp to keep it consistent
    t := CURRENT_TIMESTAMP;

    -- If we are not inserting a row; update the currently accurate row to close the applicable period
    IF TG_OP != 'INSERT' AND old.id IS NOT NULL THEN
        EXECUTE FORMAT(
                'UPDATE history.%I_history SET applicable_period = tsrange(lower(applicable_period), ''%I'', ''[]'') WHERE "id" = %L AND upper(applicable_period) is null',
                TG_TABLE_NAME,
                t,
                old.id
            );
    END IF;

    -- Insert Next History Row
    IF TG_OP != 'DELETE' AND new.id IS NOT NULL THEN
        EXECUTE format('
        INSERT INTO history.%I
        SELECT ((n.x)::%I).*, ''[%I,]''::tsrange FROM
           (VALUES (%L)) AS n (x)
      ', TG_TABLE_NAME || '_history', TG_TABLE_NAME, t, new);
    END IF;

    -- Ensure we return the correct values
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;
