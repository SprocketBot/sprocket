\set ON_ERROR_STOP on

\if :{?confirm_rollback}
\else
    \echo 'missing required psql variable: confirm_rollback'
    \quit 2
\endif

SELECT CASE
    WHEN :'confirm_rollback' = 'DELETE_MIGRATED_ROWS' THEN 1
    ELSE 1 / 0
END;

BEGIN;

DELETE FROM sprocket.match m
USING mledb_bridge.series_to_match_parent b
WHERE m."matchParentId" = b."matchParentId";

DELETE FROM sprocket.match_parent mp
USING mledb_bridge.series_to_match_parent b
WHERE mp.id = b."matchParentId";

DELETE FROM sprocket.schedule_fixture sf
USING mledb_bridge.fixture_to_fixture b
WHERE sf.id = b."sprocketFixtureId";

DELETE FROM sprocket.schedule_group sg
USING mledb_bridge.match_to_schedule_group b
WHERE sg.id = b."weekScheduleGroupId";

DELETE FROM sprocket.schedule_group sg
USING mledb_bridge.season_to_schedule_group b
WHERE sg.id = b."scheduleGroupId";

DELETE FROM sprocket.player p
USING mledb_bridge.player_to_player b
WHERE p.id = b."sprocketPlayerId";

DELETE FROM sprocket.member_profile mp
USING sprocket.member m, mledb_bridge.player_to_user b
WHERE mp."memberId" = m.id
  AND m."userId" = b."userId";

DELETE FROM sprocket.member m
USING mledb_bridge.player_to_user b
WHERE m."userId" = b."userId";

DELETE FROM sprocket.user_authentication_account uaa
USING mledb_bridge.player_to_user b
WHERE uaa."userId" = b."userId";

DELETE FROM sprocket.user_profile up
USING mledb_bridge.player_to_user b
WHERE up."userId" = b."userId";

DELETE FROM sprocket."user" u
USING mledb_bridge.player_to_user b
WHERE u.id = b."userId";

DELETE FROM sprocket.team t
USING mledb_bridge.team_to_franchise b
WHERE t."franchiseId" = b."franchiseId";

DELETE FROM sprocket.franchise_profile fp
USING mledb_bridge.team_to_franchise b
WHERE fp."franchiseId" = b."franchiseId";

DELETE FROM sprocket.franchise f
USING mledb_bridge.team_to_franchise b
WHERE f.id = b."franchiseId";

DELETE FROM sprocket.franchise_group_profile fgp
USING mledb_bridge.division_to_franchise_group b
WHERE fgp."groupId" = b."franchiseGroupId";

DELETE FROM sprocket.franchise_group fg
USING mledb_bridge.division_to_franchise_group b
WHERE fg.id = b."franchiseGroupId";

DELETE FROM sprocket.game_skill_group_profile gsgp
USING mledb_bridge.league_to_skill_group b
WHERE gsgp."skillGroupId" = b."skillGroupId";

DELETE FROM sprocket.game_skill_group gsg
USING mledb_bridge.league_to_skill_group b
WHERE gsg.id = b."skillGroupId";

DELETE FROM mledb_bridge.series_to_match_parent;
DELETE FROM mledb_bridge.fixture_to_fixture;
DELETE FROM mledb_bridge.match_to_schedule_group;
DELETE FROM mledb_bridge.season_to_schedule_group;
DELETE FROM mledb_bridge.player_to_player;
DELETE FROM mledb_bridge.player_to_user;
DELETE FROM mledb_bridge.league_to_skill_group;
DELETE FROM mledb_bridge.team_to_franchise;
DELETE FROM mledb_bridge.division_to_franchise_group;

COMMIT;
