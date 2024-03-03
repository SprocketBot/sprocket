CREATE FUNCTION create_history_table(target_table text, build_index boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
AS
$$
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
$$;
