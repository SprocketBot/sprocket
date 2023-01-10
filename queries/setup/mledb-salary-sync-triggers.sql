--
-- Create a trigger that updates mledb.player.salary every time sprocket.player.salary changes.
-- To do this, the sprocket player must be mapped to the equivalent mledb player.
--

CREATE OR REPLACE FUNCTION mledb_salary_sync() RETURNS TRIGGER AS $$
DECLARE
    mle_player_id integer;
BEGIN
    SELECT "mledPlayerId" INTO mle_player_id FROM mledb_bridge.player_to_player WHERE "sprocketPlayerId" = NEW.id;

    IF mle_player_id = NULL THEN
        RETURN NULL;
    END IF;

    UPDATE mledb.player
    SET salary = NEW.salary
    WHERE id = mle_player_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PostgreSQL 13 does not support the CREATE OR UPDATE TRIGGER syntax,
-- so here just drop the trigger before attempting to create/update it.

DROP TRIGGER IF EXISTS mledb_salary_sync_trigger ON sprocket.player;
CREATE TRIGGER mledb_salary_sync_trigger
    AFTER UPDATE OF salary ON sprocket.player
    FOR EACH ROW
    WHEN (OLD.salary IS DISTINCT FROM NEW.salary)
    EXECUTE FUNCTION mledb_salary_sync();
