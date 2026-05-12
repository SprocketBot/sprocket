\set ON_ERROR_STOP on

CREATE TEMP TABLE migration_domain_coverage (
    table_name text PRIMARY KEY,
    status text NOT NULL,
    validation_gate text NOT NULL,
    notes text NOT NULL
);

INSERT INTO migration_domain_coverage(table_name, status, validation_gate, notes)
VALUES
    ('division', 'validated', '03_validate_equivalence.sql division_mismatch', 'League structure: division name and conference.'),
    ('team', 'validated', '03_validate_equivalence.sql franchise_mismatch', 'Franchise identity: title and callsign.'),
    ('team_branding', 'validated', '03_validate_equivalence.sql franchise_mismatch', 'Franchise colors; logo photo rollback remains bridge/manual-review scoped.'),
    ('player', 'validated', '03_validate_equivalence.sql user_identity_mismatch and player_roster_mismatch', 'User/member identity for all players; Sprocket player rows for supported league players.'),
    ('season', 'validated', '03_validate_equivalence.sql season_schedule_group_mismatch', 'Season schedule group dates and description.'),
    ('match', 'validated', '03_validate_equivalence.sql fixture_mismatch', 'Week schedule group is verified through fixture parentage.'),
    ('fixture', 'validated', '03_validate_equivalence.sql fixture_mismatch', 'Fixture week, home franchise, and away franchise.'),
    ('series', 'validated', '03_validate_equivalence.sql series_match_mismatch', 'League-play series with fixture_id maps to Sprocket match parent/match.'),
    ('player_to_org', 'validated-separately', 'scripts/sql/backfill-user-org-team-permission-from-mledb.sql and reports/issue-726-org-team-permissions.md', 'Org-team permissions have a dedicated backfill and stale legacy grant audit.'),
    ('channel_map', 'deferred', 'none yet', 'Discord channel routing needs an explicit target Sprocket configuration/webhook mapping.'),
    ('config', 'deferred', 'none yet', 'Legacy configuration needs product-level key mapping before migration.'),
    ('draft_order', 'deferred', 'none yet', 'Draft workflow data is not covered by the current Sprocket league-core migration.'),
    ('eligibility_data', 'deferred', 'none yet', 'Eligibility history needs a Sprocket target contract.'),
    ('elo_data', 'deferred', 'queries/setup/elo-migration-view.sql only', 'Elo has adjacent setup SQL but is not part of this backfill validation.'),
    ('footers', 'deferred', 'none yet', 'Presentation/footer content needs an explicit target mapping.'),
    ('league_branding', 'deferred', 'none yet', 'League branding must map to skill-group/organization presentation fields before validation.'),
    ('player_account', 'deferred', 'none yet', 'Platform account migration must map to member_platform_account.'),
    ('player_history', 'deferred', 'none yet', 'Historical roster/player state needs a target history model or archival policy.'),
    ('player_stats', 'deferred', 'none yet', 'Stats migration needs row-level stat-line mapping and aggregate reconciliation.'),
    ('player_stats_core', 'deferred', 'none yet', 'Core stats migration needs row-level stat-line mapping and aggregate reconciliation.'),
    ('psyonix_api_result', 'deferred', 'none yet', 'Raw API cache/result retention needs archival policy.'),
    ('salary_cap', 'deferred', 'none yet', 'Salary-cap history needs target mapping beyond current skill-group constants.'),
    ('scrim', 'deferred', 'none yet', 'Scrim migration must map to saved_scrim/match_parent and replay submission state.'),
    ('series_replay', 'deferred', 'none yet', 'Replay evidence needs target object/storage/submission mapping.'),
    ('stream_event', 'deferred', 'none yet', 'Stream events need target scheduled-event/webhook mapping.'),
    ('team_core_stats', 'deferred', 'none yet', 'Team stats migration needs stat-line mapping and aggregate reconciliation.'),
    ('team_role_usage', 'deferred', 'none yet', 'Role usage needs roster_role_usages mapping and validation.'),
    ('team_to_captain', 'deferred', 'none yet', 'Captain/team role semantics need target roster/staff mapping.');

CREATE TEMP TABLE migration_domain_coverage_issues AS
SELECT 'unknown_mledb_table' AS issue_type,
       t.table_name,
       NULL::text AS status,
       'mledb table exists without a migration coverage classification' AS detail
FROM information_schema.tables t
LEFT JOIN migration_domain_coverage c ON c.table_name = t.table_name
WHERE t.table_schema = 'mledb'
  AND t.table_type = 'BASE TABLE'
  AND c.table_name IS NULL
UNION ALL
SELECT 'classified_missing_table' AS issue_type,
       c.table_name,
       c.status,
       'coverage manifest references a table not present in mledb' AS detail
FROM migration_domain_coverage c
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'mledb'
 AND t.table_name = c.table_name
 AND t.table_type = 'BASE TABLE'
WHERE t.table_name IS NULL;

SELECT c.table_name, c.status, c.validation_gate, c.notes
FROM migration_domain_coverage c
ORDER BY
    CASE c.status
        WHEN 'validated' THEN 0
        WHEN 'validated-separately' THEN 1
        WHEN 'deferred' THEN 2
        ELSE 3
    END,
    c.table_name;

TABLE migration_domain_coverage_issues
ORDER BY issue_type, table_name;

DO $$
DECLARE
    issue_count int;
BEGIN
    SELECT count(*) INTO issue_count
    FROM migration_domain_coverage_issues;

    IF issue_count > 0 THEN
        RAISE EXCEPTION 'mledb domain coverage manifest has % issue(s)', issue_count;
    END IF;
END;
$$;
