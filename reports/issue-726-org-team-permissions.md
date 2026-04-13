# Issue 726: Org-team permissions (Sprocket source of truth)

## Runtime source of truth

League org-team / LO-style permission bits used in JWTs and GraphQL guards are stored in **`sprocket.user_org_team_permission`**, one row per `(userId, orgTeam)` where `orgTeam` is the numeric `MLE_OrganizationTeam` enum.

Core APIs:

- `UserOrgTeamPermissionService` — read/write against that table.
- `OrgTeamPermissionResolutionService` — resolves the org-team list for a Sprocket user id (used at login, refresh, and a few services/guards).

Admin GraphQL (MLEDB admin guard): `userOrgTeamPermissions`, `setUserOrgTeamPermissions`, `addUserOrgTeamPermission`, `removeUserOrgTeamPermission`.

## Temporary dual-read from MLEDB

If a user has **no** rows in `user_org_team_permission`, and the environment variable **`ORG_TEAM_PERMISSION_DUAL_READ=true`**, resolution falls back to legacy `mledb.player_to_org` for that user.

**Removal plan:** After backfilling Sprocket permissions for all users who still rely on MLEDB (or after MLEDB is fully retired for auth), set `ORG_TEAM_PERMISSION_DUAL_READ` to `false` or unset it everywhere, confirm no regressions, then delete the fallback branch in `OrgTeamPermissionResolutionService` and any ops docs referencing the flag.

## Migration

Apply TypeORM migration `1770500000000-UserOrgTeamPermission` (creates `sprocket.user_org_team_permission`).
