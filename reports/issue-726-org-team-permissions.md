# Issue 726: Org-team permissions (Sprocket source of truth)

## Runtime source of truth

League org-team / LO-style permission bits used in JWTs and GraphQL guards are stored in **`sprocket.user_org_team_permission`**, one row per `(userId, orgTeam)` where `orgTeam` is the numeric `MLE_OrganizationTeam` enum.

Core APIs:

- `UserOrgTeamPermissionService` — read/write against that table.
- `OrgTeamPermissionResolutionService` — resolves the org-team list for a Sprocket user id (used at login, refresh, and a few services/guards).

Admin GraphQL (MLEDB admin guard): `userOrgTeamPermissions`, `setUserOrgTeamPermissions`, `addUserOrgTeamPermission`, `removeUserOrgTeamPermission`.

## Temporary dual-read from MLEDB

When **`ORG_TEAM_PERMISSION_DUAL_READ=true`**, every resolution loads **both** Sprocket (`user_org_team_permission`) and legacy MLEDB (`player_to_org` via the linked player) and **compares** the two sets. Mismatches are logged (`warn` when both sides have data but differ, or Sprocket has rows while MLEDB is empty; `verbose` when Sprocket is empty but MLEDB has rows—common until backfill).

**Effective permissions:** while dual-read remains enabled, runtime authorization uses the **union** of Sprocket and MLEDB org-team rows. This keeps partially backfilled users from losing legacy permissions like `LEAGUE_OPERATIONS` during the migration window. Once dual-read is disabled, effective permissions are Sprocket-only.

**Risk:** dual-read union still trusts legacy `mledb.player_to_org`. That is intentional only during the migration window; stale legacy rows can continue granting access until the flag is disabled.

**Prod rollout (Pulumi):** the `platform` stack sets `ORG_TEAM_PERMISSION_DUAL_READ` on the core (and monolith) Docker service from Pulumi config key **`org-team-permission-dual-read`**. The committed `infra/platform/Pulumi.prod.yaml` sets it to **`true`** until backfill is done; flip it to **`false`** and `pulumi up` after validation.

**Backfill:** run `scripts/sql/backfill-user-org-team-permission-from-mledb.sql` against prod Postgres (same DB as `mledb` + `sprocket`).

**Audit before leaving dual-read enabled:**

```sql
WITH legacy AS (
  SELECT uaa."userId", pto.org_team
  FROM mledb.player_to_org pto
  INNER JOIN mledb.player p ON p.id = pto.player_id
  INNER JOIN sprocket.user_authentication_account uaa
    ON uaa."accountId" = p.discord_id
   AND uaa."accountType" = 'DISCORD'
),
sprocket_rows AS (
  SELECT "userId", "orgTeam" AS org_team
  FROM sprocket.user_org_team_permission
)
SELECT legacy."userId", legacy.org_team
FROM legacy
LEFT JOIN sprocket_rows sr
  ON sr."userId" = legacy."userId"
 AND sr.org_team = legacy.org_team
WHERE sr."userId" IS NULL
ORDER BY legacy."userId", legacy.org_team;
```

This query should return only expected temporary gaps immediately after backfill. Any unexpected rows are still legacy-only grants and should be reconciled before disabling dual-read.

**Removal plan:** After backfilling Sprocket permissions for all users who still rely on MLEDB (or after MLEDB is fully retired for auth), set `org-team-permission-dual-read` / `ORG_TEAM_PERMISSION_DUAL_READ` to `false`, confirm no regressions, then delete the fallback branch in `OrgTeamPermissionResolutionService` and any ops docs referencing the flag.

## Migration

Apply TypeORM migration `1770500000000-UserOrgTeamPermission` (creates `sprocket.user_org_team_permission`).
