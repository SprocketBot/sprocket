\set ON_ERROR_STOP on

\if :{?migration_run_id}
\else
    \echo 'missing required psql variable: migration_run_id'
    \quit 2
\endif

\ir 00_guard_schema.sql

CREATE TEMP TABLE migration_validation_issues (
    issue_type text NOT NULL,
    source_key text,
    source_payload jsonb,
    target_payload jsonb,
    detail text NOT NULL
);

INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT issue_type,
       concat(schema_name, '.', table_name, ':', coalesce(primary_key::text, '<table>')),
       jsonb_build_object('before_hash', before_hash),
       jsonb_build_object('after_hash', after_hash),
       detail
FROM migration_guard.validate_sprocket_baseline(:'migration_run_id'::uuid);

WITH source_rows AS (
    SELECT d.name, d.conference
    FROM mledb.division d
    WHERE d.conference <> 'META'
),
target_rows AS (
    SELECT b.divison AS name, parent_profile.name AS conference
    FROM mledb_bridge.division_to_franchise_group b
    JOIN sprocket.franchise_group fg ON fg.id = b."franchiseGroupId"
    JOIN sprocket.franchise_group parent_fg ON parent_fg.id = fg."parentGroupId"
    JOIN sprocket.franchise_group_profile parent_profile ON parent_profile."groupId" = parent_fg.id
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'division_mismatch',
       coalesce(s.name, t.name),
       to_jsonb(s),
       to_jsonb(t),
       'mledb.division must map to one sprocket franchise group with the same name and conference'
FROM source_rows s
FULL JOIN target_rows t USING (name)
WHERE s IS NULL
   OR t IS NULL
   OR (CASE s.conference WHEN 'ORANGE' THEN 'Orange' WHEN 'BLUE' THEN 'Blue' ELSE s.conference END) IS DISTINCT FROM t.conference;

WITH source_rows AS (
    SELECT t.name, t.callsign, tb.primary_color, tb.secondary_color
    FROM mledb.team t
    LEFT JOIN mledb.team_branding tb ON tb.team_name = t.name
    WHERE t.division_name <> 'Meta'
),
target_rows AS (
    SELECT b.team AS name, fp.code AS callsign, fp."primaryColor" AS primary_color, fp."secondaryColor" AS secondary_color
    FROM mledb_bridge.team_to_franchise b
    JOIN sprocket.franchise_profile fp ON fp."franchiseId" = b."franchiseId"
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'franchise_mismatch',
       coalesce(s.name, t.name),
       to_jsonb(s),
       to_jsonb(t),
       'mledb.team/team_branding must map to one sprocket franchise profile'
FROM source_rows s
FULL JOIN target_rows t USING (name)
WHERE s IS NULL
   OR t IS NULL
   OR s.callsign IS DISTINCT FROM t.callsign
   OR s.primary_color IS DISTINCT FROM t.primary_color
   OR s.secondary_color IS DISTINCT FROM t.secondary_color;

WITH expected AS (
    SELECT p.id AS player_id,
           p.name,
           nullif(p.discord_id, '') AS discord_id
    FROM mledb.player p
),
actual AS (
    SELECT ptu."playerId" AS player_id,
           up."displayName" AS name,
           uaa."accountId" AS discord_id
    FROM mledb_bridge.player_to_user ptu
    JOIN sprocket."user" u ON u.id = ptu."userId"
    JOIN sprocket.user_profile up ON up."userId" = u.id
    JOIN sprocket.member m ON m."userId" = u.id
    LEFT JOIN sprocket.user_authentication_account uaa
      ON uaa."userId" = u.id
     AND uaa."accountType"::text = 'DISCORD'
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'user_identity_mismatch',
       coalesce(s.player_id, a.player_id)::text,
       to_jsonb(s),
       to_jsonb(a),
       'mledb.player identity and Discord account must match sprocket user/member rows'
FROM expected s
FULL JOIN actual a USING (player_id)
WHERE s IS NULL
   OR a IS NULL
   OR s.name IS DISTINCT FROM a.name
   OR s.discord_id IS DISTINCT FROM a.discord_id;

WITH expected AS (
    SELECT p.id AS player_id,
           p.league,
           p.salary
    FROM mledb.player p
    WHERE p.league IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER')
),
actual AS (
    SELECT ptu."playerId" AS player_id,
           gsgp.code AS league_code,
           sp.salary
    FROM mledb_bridge.player_to_user ptu
    JOIN sprocket.member m ON m."userId" = ptu."userId"
    JOIN sprocket.player sp ON sp."memberId" = m.id
    JOIN sprocket.game_skill_group gsg ON gsg.id = sp."skillGroupId"
    JOIN sprocket.game_skill_group_profile gsgp ON gsgp."skillGroupId" = gsg.id
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'player_roster_mismatch',
       coalesce(s.player_id, a.player_id)::text,
       to_jsonb(s),
       to_jsonb(a),
       'supported MLEDB player league and salary must match Sprocket player rows'
FROM expected s
FULL JOIN actual a USING (player_id)
WHERE s IS NULL
   OR a IS NULL
   OR (CASE s.league
         WHEN 'PREMIER' THEN 'PL'
         WHEN 'MASTER' THEN 'ML'
         WHEN 'CHAMPION' THEN 'CL'
         WHEN 'ACADEMY' THEN 'AL'
         WHEN 'FOUNDATION' THEN 'FL'
         ELSE s.league
       END) IS DISTINCT FROM a.league_code
   OR s.salary IS DISTINCT FROM a.salary;

WITH source_rows AS (
    SELECT season_number, start_date, end_date, concat('Season ', season_number) AS description
    FROM mledb.season
),
target_rows AS (
    SELECT b."seasonNumber" AS season_number, sg.start AS start_date, sg."end" AS end_date, sg.description
    FROM mledb_bridge.season_to_schedule_group b
    JOIN sprocket.schedule_group sg ON sg.id = b."scheduleGroupId"
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'season_schedule_group_mismatch',
       coalesce(s.season_number, t.season_number)::text,
       to_jsonb(s),
       to_jsonb(t),
       'mledb.season must map to one sprocket season schedule group'
FROM source_rows s
FULL JOIN target_rows t USING (season_number)
WHERE s IS NULL
   OR t IS NULL
   OR s.start_date IS DISTINCT FROM t.start_date
   OR s.end_date IS DISTINCT FROM t.end_date
   OR s.description IS DISTINCT FROM t.description;

WITH source_rows AS (
    SELECT f.id AS fixture_id, f.match_id, f.home_name, f.away_name
    FROM mledb.fixture f
),
target_rows AS (
    SELECT b."mleFixtureId" AS fixture_id,
           mtw."matchId" AS match_id,
           home_bridge.team AS home_name,
           away_bridge.team AS away_name
    FROM mledb_bridge.fixture_to_fixture b
    JOIN sprocket.schedule_fixture sf ON sf.id = b."sprocketFixtureId"
    JOIN mledb_bridge.match_to_schedule_group mtw ON mtw."weekScheduleGroupId" = sf."scheduleGroupId"
    JOIN mledb_bridge.team_to_franchise home_bridge ON home_bridge."franchiseId" = sf."homeFranchiseId"
    JOIN mledb_bridge.team_to_franchise away_bridge ON away_bridge."franchiseId" = sf."awayFranchiseId"
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'fixture_mismatch',
       coalesce(s.fixture_id, t.fixture_id)::text,
       to_jsonb(s),
       to_jsonb(t),
       'mledb.fixture must map to one sprocket schedule fixture with same week and teams'
FROM source_rows s
FULL JOIN target_rows t USING (fixture_id)
WHERE s IS NULL
   OR t IS NULL
   OR s.match_id IS DISTINCT FROM t.match_id
   OR s.home_name IS DISTINCT FROM t.home_name
   OR s.away_name IS DISTINCT FROM t.away_name;

WITH source_rows AS (
    SELECT id AS series_id, fixture_id, league, mode
    FROM mledb.series
    WHERE fixture_id IS NOT NULL
      AND league IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER')
),
target_rows AS (
    SELECT b."seriesId" AS series_id,
           ftf."mleFixtureId" AS fixture_id,
           lsg.league,
           replace(gm.code, 'RL_', '') AS mode
    FROM mledb_bridge.series_to_match_parent b
    JOIN mledb_bridge.fixture_to_fixture ftf ON ftf."sprocketFixtureId" = (
        SELECT mp."fixtureId"
        FROM sprocket.match_parent mp
        WHERE mp.id = b."matchParentId"
    )
    JOIN sprocket.match sm ON sm."matchParentId" = b."matchParentId"
    JOIN mledb_bridge.league_to_skill_group lsg ON lsg."skillGroupId" = sm."skillGroupId"
    JOIN sprocket.game_mode gm ON gm.id = sm."gameModeId"
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'series_match_mismatch',
       coalesce(s.series_id, t.series_id)::text,
       to_jsonb(s),
       to_jsonb(t),
       'mledb.series must map to one sprocket match parent/match with same fixture, league, and mode'
FROM source_rows s
FULL JOIN target_rows t USING (series_id)
WHERE s IS NULL
   OR t IS NULL
   OR s.fixture_id IS DISTINCT FROM t.fixture_id
   OR s.league IS DISTINCT FROM t.league
   OR s.mode IS DISTINCT FROM t.mode;

WITH bridge_counts AS (
    SELECT 'division_to_franchise_group' AS bridge, count(*) AS rows, count(DISTINCT divison) AS source_keys, count(DISTINCT "franchiseGroupId") AS target_keys FROM mledb_bridge.division_to_franchise_group
    UNION ALL SELECT 'team_to_franchise', count(*), count(DISTINCT team), count(DISTINCT "franchiseId") FROM mledb_bridge.team_to_franchise
    UNION ALL SELECT 'player_to_user', count(*), count(DISTINCT "playerId"), count(DISTINCT "userId") FROM mledb_bridge.player_to_user
    UNION ALL SELECT 'player_to_player', count(*), count(DISTINCT "mledPlayerId"), count(DISTINCT "sprocketPlayerId") FROM mledb_bridge.player_to_player
    UNION ALL SELECT 'season_to_schedule_group', count(*), count(DISTINCT "seasonNumber"), count(DISTINCT "scheduleGroupId") FROM mledb_bridge.season_to_schedule_group
    UNION ALL SELECT 'match_to_schedule_group', count(*), count(DISTINCT "matchId"), count(DISTINCT "weekScheduleGroupId") FROM mledb_bridge.match_to_schedule_group
    UNION ALL SELECT 'fixture_to_fixture', count(*), count(DISTINCT "mleFixtureId"), count(DISTINCT "sprocketFixtureId") FROM mledb_bridge.fixture_to_fixture
    UNION ALL SELECT 'series_to_match_parent', count(*), count(DISTINCT "seriesId"), count(DISTINCT "matchParentId") FROM mledb_bridge.series_to_match_parent
)
INSERT INTO migration_validation_issues(issue_type, source_key, source_payload, target_payload, detail)
SELECT 'bridge_not_one_to_one',
       bridge,
       to_jsonb(bridge_counts),
       NULL,
       'bridge tables must be one-to-one so semantic comparisons are trustworthy'
FROM bridge_counts
WHERE rows <> source_keys OR rows <> target_keys;

TABLE migration_validation_issues
ORDER BY issue_type, source_key NULLS FIRST;

DO $$
DECLARE
    issue_count int;
BEGIN
    SELECT count(*) INTO issue_count
    FROM migration_validation_issues;

    IF issue_count > 0 THEN
        RAISE EXCEPTION 'mledb -> sprocket validation found % issue(s)', issue_count;
    END IF;
END;
$$;

UPDATE migration_guard.runs
SET completed_at = now(),
    status = 'validated'
WHERE run_id = :'migration_run_id'::uuid;
