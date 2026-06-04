\set ON_ERROR_STOP on

CREATE TEMP TABLE migration_preflight_issues (
    severity text NOT NULL,
    check_name text NOT NULL,
    detail text NOT NULL
);

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'required_schema', format('missing schema %s', schema_name)
FROM (VALUES ('mledb'), ('sprocket'), ('mledb_bridge')) AS required(schema_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.schemata s
    WHERE s.schema_name = required.schema_name
);

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'required_table', format('missing table %s.%s', schema_name, table_name)
FROM (
    VALUES
        ('mledb', 'division'),
        ('mledb', 'team'),
        ('mledb', 'team_branding'),
        ('mledb', 'player'),
        ('mledb', 'season'),
        ('mledb', 'match'),
        ('mledb', 'fixture'),
        ('mledb', 'series'),
        ('sprocket', 'organization'),
        ('sprocket', 'organization_profile'),
        ('sprocket', 'game'),
        ('sprocket', 'game_mode'),
        ('sprocket', 'franchise'),
        ('sprocket', 'franchise_profile'),
        ('sprocket', 'game_skill_group'),
        ('sprocket', 'team'),
        ('sprocket', 'user'),
        ('sprocket', 'user_profile'),
        ('sprocket', 'user_authentication_account'),
        ('sprocket', 'member'),
        ('sprocket', 'member_profile'),
        ('sprocket', 'player'),
        ('sprocket', 'schedule_group'),
        ('sprocket', 'schedule_fixture'),
        ('sprocket', 'match_parent'),
        ('sprocket', 'match'),
        ('mledb_bridge', 'division_to_franchise_group'),
        ('mledb_bridge', 'team_to_franchise'),
        ('mledb_bridge', 'league_to_skill_group'),
        ('mledb_bridge', 'player_to_user'),
        ('mledb_bridge', 'player_to_player'),
        ('mledb_bridge', 'season_to_schedule_group'),
        ('mledb_bridge', 'match_to_schedule_group'),
        ('mledb_bridge', 'fixture_to_fixture'),
        ('mledb_bridge', 'series_to_match_parent')
) AS required(schema_name, table_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.tables t
    WHERE t.table_schema = required.schema_name
      AND t.table_name = required.table_name
);

TABLE migration_preflight_issues
ORDER BY CASE severity WHEN 'blocker' THEN 0 ELSE 1 END, check_name, detail;

DO $$
DECLARE
    structural_blocker_count int;
BEGIN
    SELECT count(*) INTO structural_blocker_count
    FROM migration_preflight_issues
    WHERE severity = 'blocker'
      AND check_name IN ('required_schema', 'required_table');

    IF structural_blocker_count > 0 THEN
        RAISE EXCEPTION 'mledb -> sprocket preflight found % structural blocker(s)', structural_blocker_count;
    END IF;
END;
$$;

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'duplicate_discord_id', format('discord_id %s appears %s times in mledb.player', discord_id, count(*))
FROM mledb.player
WHERE nullif(discord_id, '') IS NOT NULL
GROUP BY discord_id
HAVING count(*) > 1;

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'duplicate_player_name', format('player name %s appears %s times in mledb.player', name, count(*))
FROM mledb.player
GROUP BY name
HAVING count(*) > 1;

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'fixture_missing_team_bridge_source', format('fixture %s references missing team home=%s away=%s', f.id, f.home_name, f.away_name)
FROM mledb.fixture f
LEFT JOIN mledb.team ht ON ht.name = f.home_name
LEFT JOIN mledb.team at ON at.name = f.away_name
WHERE ht.name IS NULL OR at.name IS NULL;

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'series_unknown_league', format('series %s has unsupported league %s', id, league)
FROM mledb.series
WHERE fixture_id IS NOT NULL
  AND league NOT IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER');

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'series_unknown_mode', format('series %s has unsupported mode %s', id, mode)
FROM mledb.series
WHERE fixture_id IS NOT NULL
  AND mode NOT IN ('DOUBLES', 'STANDARD');

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'blocker', 'player_unknown_league', format('player %s (%s) has unsupported league %s', id, name, league)
FROM mledb.player
WHERE league NOT IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER', 'UNKNOWN');

INSERT INTO migration_preflight_issues(severity, check_name, detail)
SELECT 'warning', 'bridge_table_not_empty', format('%s.%s already contains %s rows', table_schema, table_name, row_count)
FROM (
    SELECT 'mledb_bridge'::text AS table_schema, 'division_to_franchise_group'::text AS table_name, count(*)::bigint AS row_count FROM mledb_bridge.division_to_franchise_group
    UNION ALL SELECT 'mledb_bridge', 'team_to_franchise', count(*) FROM mledb_bridge.team_to_franchise
    UNION ALL SELECT 'mledb_bridge', 'league_to_skill_group', count(*) FROM mledb_bridge.league_to_skill_group
    UNION ALL SELECT 'mledb_bridge', 'player_to_user', count(*) FROM mledb_bridge.player_to_user
    UNION ALL SELECT 'mledb_bridge', 'player_to_player', count(*) FROM mledb_bridge.player_to_player
    UNION ALL SELECT 'mledb_bridge', 'season_to_schedule_group', count(*) FROM mledb_bridge.season_to_schedule_group
    UNION ALL SELECT 'mledb_bridge', 'match_to_schedule_group', count(*) FROM mledb_bridge.match_to_schedule_group
    UNION ALL SELECT 'mledb_bridge', 'fixture_to_fixture', count(*) FROM mledb_bridge.fixture_to_fixture
    UNION ALL SELECT 'mledb_bridge', 'series_to_match_parent', count(*) FROM mledb_bridge.series_to_match_parent
) bridge_counts
WHERE row_count > 0;

TABLE migration_preflight_issues
ORDER BY CASE severity WHEN 'blocker' THEN 0 ELSE 1 END, check_name, detail;

DO $$
DECLARE
    blocker_count int;
BEGIN
    SELECT count(*) INTO blocker_count
    FROM migration_preflight_issues
    WHERE severity = 'blocker';

    IF blocker_count > 0 THEN
        RAISE EXCEPTION 'mledb -> sprocket preflight found % blocker(s)', blocker_count;
    END IF;
END;
$$;
