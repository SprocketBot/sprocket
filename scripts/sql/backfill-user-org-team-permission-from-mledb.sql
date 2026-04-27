-- Backfill Sprocket org-team permissions from legacy MLEDB (issue #726 / issue #4).
--
-- Prerequisites:
--   1. Migration that creates sprocket.user_org_team_permission has been applied.
--   2. Run against the same database that holds both `mledb` and `sprocket` schemas.
--
-- This maps mledb.player -> discord_id -> sprocket.user_authentication_account (DISCORD)
-- and copies distinct (userId, org_team) pairs. Idempotent: safe to re-run.
--
-- After verifying counts and a spot-check of JWTs, set ORG_TEAM_PERMISSION_DUAL_READ=false
-- in prod Pulumi and redeploy core.
--
-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
--
-- Run in three phases:
--
--   Phase 1: Diagnostics (read-only)
--     - Run all queries in PHASE 1 section
--     - Review counts and identify any gaps
--     - Abort if orphan count is unexpectedly high
--
--   Phase 2: Dry-run Preview (read-only)
--     - Run PHASE 2 query to see exactly what would be inserted
--     - Verify the preview looks correct
--     - Sample 5-10 users manually against MLEDB to confirm
--
--   Phase 3: Actual Backfill (transactional)
--     - Run PHASE 3 during low-traffic window
--     - Script is atomic (all-or-nothing)
--     - Review post-backfill validation queries
--     - COMMIT if validation passes, ROLLBACK if not
--
--   Phase 4: Post-Backfill Validation
--     - Run validation queries to confirm success
--     - Sample backfilled users for manual verification
--     - Document results in ops log
--
-- ============================================================
-- PHASE 1: DIAGNOSTICS (Run first, read-only)
-- ============================================================

-- Current state of Sprocket permissions
SELECT 
    'Current Sprocket permissions' AS metric, 
    count(*) AS row_count
FROM sprocket.user_org_team_permission;

-- MLEDB permissions distribution by org team
SELECT 
    'MLEDB permissions by team' AS metric, 
    pto.org_team, 
    count(*) AS permission_count
FROM mledb.player_to_org pto
GROUP BY pto.org_team
ORDER BY pto.org_team;

-- Total MLEDB permissions
SELECT 
    'Total MLEDB permissions' AS metric, 
    count(*) AS row_count
FROM mledb.player_to_org;

-- Orphaned MLEDB permissions (players without Discord linkage)
-- These CANNOT be backfilled and need manual resolution
SELECT 
    'Orphaned MLEDB permissions (no Discord)' AS metric, 
    count(DISTINCT pto.id) AS orphan_count,
    count(DISTINCT p.player_id) AS affected_players,
    'ACTION: Manual review required' AS recommendation
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
WHERE p.discord_id IS NULL 
   OR btrim(p.discord_id) = '';

-- Backfill candidates (users with MLEDB permissions but no Sprocket permissions)
SELECT 
    'Backfill candidates' AS metric, 
    count(DISTINCT uaa."userId") AS user_count,
    count(DISTINCT pto.org_team) AS unique_teams,
    count(*) AS total_permissions_to_backfill
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
LEFT JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
  AND uotp."userId" IS NULL;

-- Users with permissions in BOTH systems (potential mismatches)
SELECT 
    'Users with both Sprocket and MLEDB (check for mismatches)' AS metric,
    count(DISTINCT uaa."userId") AS user_count
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
INNER JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> '';

-- ============================================================
-- PHASE 2: DRY-RUN PREVIEW (Run second, read-only)
-- ============================================================

-- Preview rows that would be inserted (no actual insert)
-- Review this output carefully before proceeding to Phase 3
SELECT 
    uaa."userId" AS "userId",
    pto.org_team::smallint AS "orgTeam",
    now() AS "createdAt",
    now() AS "updatedAt",
    'WOULD BE INSERTED' AS action
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
LEFT JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
  AND uotp."userId" IS NULL
ORDER BY uaa."userId", pto.org_team;

-- Summary of dry-run
SELECT 
    'Dry-run summary' AS metric,
    count(*) AS rows_would_be_inserted,
    count(DISTINCT uaa."userId") AS users_affected
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
LEFT JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
  AND uotp."userId" IS NULL;

-- ============================================================
-- PHASE 3: ACTUAL BACKFILL (Transactional - run during low-traffic window)
-- ============================================================

BEGIN;

-- Capture pre-insert baseline
SELECT 
    'PRE-BACKFILL: Sprocket permissions count' AS metric, 
    count(*) AS row_count
FROM sprocket.user_org_team_permission;

-- Capture pre-insert user count
SELECT 
    'PRE-BACKFILL: Unique users with permissions' AS metric, 
    count(DISTINCT "userId") AS user_count
FROM sprocket.user_org_team_permission;

-- Perform the backfill insert
-- This is idempotent: ON CONFLICT DO NOTHING prevents duplicates
INSERT INTO sprocket.user_org_team_permission ("userId", "orgTeam", "createdAt", "updatedAt")
SELECT DISTINCT
    uaa."userId" AS "userId",
    pto.org_team::smallint AS "orgTeam",
    now() AS "createdAt",
    now() AS "updatedAt"
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'::sprocket.user_authentication_account_accounttype_enum
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
ON CONFLICT ("userId", "orgTeam") DO NOTHING;

-- Capture post-insert count
SELECT 
    'POST-BACKFILL: Sprocket permissions count' AS metric, 
    count(*) AS row_count
FROM sprocket.user_org_team_permission;

-- Capture post-insert user count
SELECT 
    'POST-BACKFILL: Unique users with permissions' AS metric, 
    count(DISTINCT "userId") AS user_count
FROM sprocket.user_org_team_permission;

-- Calculate rows actually inserted
SELECT 
    'ROWS INSERTED' AS metric, 
    count(*) AS inserted_count
FROM sprocket.user_org_team_permission uotp
WHERE uotp."createdAt" >= now() - interval '5 minutes';

-- Distribution of inserted permissions by org team
SELECT 
    'INSERTED: By org team' AS metric,
    uotp."orgTeam",
    count(*) AS inserted_count
FROM sprocket.user_org_team_permission uotp
WHERE uotp."createdAt" >= now() - interval '5 minutes'
GROUP BY uotp."orgTeam"
ORDER BY uotp."orgTeam";

-- ============================================================
-- VALIDATION QUERIES (Run BEFORE COMMIT to verify)
-- ============================================================

-- Verify no users have MLEDB permissions but no Sprocket permissions
-- This should return 0 if backfill was complete
SELECT 
    'VALIDATION: Users with MLEDB but no Sprocket (SHOULD BE 0)' AS metric, 
    count(DISTINCT uaa."userId") AS gap_count
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
LEFT JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
  AND uotp."userId" IS NULL;

-- Sample 20 backfilled users for manual verification
-- Compare these against MLEDB to confirm correctness
SELECT 
    uotp."userId",
    uotp."orgTeam",
    uotp."createdAt",
    p.discord_id,
    p.name AS player_name,
    'VERIFY: Check against MLEDB' AS action
FROM sprocket.user_org_team_permission uotp
INNER JOIN sprocket.user_authentication_account uaa
    ON uotp."userId" = uaa."userId"
    AND uaa."accountType" = 'DISCORD'
INNER JOIN mledb.player p ON p.discord_id = uaa."accountId"
WHERE uotp."createdAt" >= now() - interval '5 minutes'
ORDER BY uotp."userId", uotp."orgTeam"
LIMIT 20;

-- ============================================================
-- COMMIT OR ROLLBACK
-- ============================================================
-- 
-- If validation queries above look correct:
--   - Run COMMIT to finalize the backfill
--
-- If validation shows issues:
--   - Run ROLLBACK to undo the backfill
--   - Investigate the issue
--   - Re-run Phase 3 after fixing
--
-- Example:
--   COMMIT;  -- Finalize backfill
--   ROLLBACK; -- Undo backfill
--
-- ============================================================

-- Uncomment one of the following to finalize:
-- COMMIT;
-- ROLLBACK;

-- ============================================================
-- PHASE 4: POST-BACKFILL VALIDATION (Run AFTER COMMIT)
-- ============================================================

-- Final row count
SELECT 
    'FINAL: Total Sprocket permissions' AS metric, 
    count(*) AS row_count
FROM sprocket.user_org_team_permission;

-- Final user count
SELECT 
    'FINAL: Unique users with permissions' AS metric, 
    count(DISTINCT "userId") AS user_count
FROM sprocket.user_org_team_permission;

-- Verify completeness (should be 0)
SELECT 
    'FINAL: Remaining gaps (SHOULD BE 0)' AS metric, 
    count(DISTINCT uaa."userId") AS gap_count
FROM mledb.player_to_org pto
INNER JOIN mledb.player p ON p.id = pto.player_id
INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
    AND uaa."accountType" = 'DISCORD'
LEFT JOIN sprocket.user_org_team_permission uotp
    ON uotp."userId" = uaa."userId"
    AND uotp."orgTeam" = pto.org_team::smallint
WHERE p.discord_id IS NOT NULL
  AND btrim(p.discord_id) <> ''
  AND uotp."userId" IS NULL;

-- Distribution of all permissions by org team (post-backfill)
SELECT 
    'FINAL: Permissions by org team' AS metric,
    "orgTeam",
    count(*) AS total_count
FROM sprocket.user_org_team_permission
GROUP BY "orgTeam"
ORDER BY "orgTeam";
