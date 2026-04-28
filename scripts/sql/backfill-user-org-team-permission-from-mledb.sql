-- Backfill Sprocket org-team permissions from legacy MLEDB (issue #726).
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

BEGIN;

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

COMMIT;

-- Optional diagnostics (run separately if you want a summary before COMMIT):
-- SELECT count(*) FROM sprocket.user_org_team_permission;
-- SELECT pto.org_team, count(*) FROM mledb.player_to_org pto GROUP BY 1 ORDER BY 1;
