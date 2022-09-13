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

CREATE OR REPLACE FUNCTION update_history_table()
    RETURNS trigger
    LANGUAGE plpgsql AS
$body$
DECLARE
    t timestamptz;
BEGIN
    -- Grab a timestamp to keep it consistent
    t := CURRENT_TIMESTAMP;
    
    -- If we are not inserting a row; update the currently accurate row to close the applicable period
    IF TG_OP != 'INSERT' AND old.id IS NOT NULL THEN
        EXECUTE FORMAT(
            'UPDATE history.%I SET applicable_period = tsrange(lower(applicable_period), ''%I'', ''[]'') WHERE "id" = %L AND upper(applicable_period) is null',
            TG_TABLE_NAME || '_history',
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
$body$;
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
