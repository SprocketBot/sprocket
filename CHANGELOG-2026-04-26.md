# Changelog — April 13–26, 2026

## Feature: Sprocket-Primary Platform Identity ([PR #737](https://github.com/SprocketBot/sprocket/pull/737))

- Sprocket is now the primary source of truth for platform account resolution. Legacy `mledb.player_account` and Discord fallback are only used when no `member_platform_account` row exists.
- Discord OAuth: returning users no longer require `mledb.player`; legacy accounts are synced via upsert.
- Intake flow: optional Steam IDs on `CreatePlayerTuple`; writes go to Sprocket and mirror to `mledb` when the `MLE_Player` bridge exists.
- Member relink: re-upserts `mledb.player_account` after Sprocket update.
- `getPlayerByPlatformId`: only uses `mledb.player_account` when no Sprocket `member_platform_account` row exists.
- `upsertMemberPlatformAccount`: respects unique `(platform, platformAccountId)`; throws explicit conflict if another member already owns the link.
- TM players without MLEDB entries are now handled via left join instead of inner join.
- Migration: dropped unique tracker index on `mledb.player_account`.

## Feature: Sprocket as Source of Truth for Org-Team Permissions ([PR #738](https://github.com/SprocketBot/sprocket/pull/738))

- New table `sprocket.user_org_team_permission` (migration `1770500000000-UserOrgTeamPermission`) with unique `(userId, orgTeam)` and FK constraints.
- Permission bits used in JWTs and guards now persist in Sprocket instead of reading `mledb.player_to_org` on every login/refresh.
- Backfill sync from MLEDB on first access.
- All CRUD operations for org-team permissions now go through Sprocket services and GraphQL resolvers.

## Feature: Scrim Points & Eligibility Date on Web Client ([PR #741](https://github.com/SprocketBot/sprocket/pull/741))

- Added `scrimPoints` and `eligibilityEndDate` resolve fields on the `Player` GraphQL type.
- New "Scrim Eligibility" dashboard card on the scrims index page:
  - Green "Eligible until {date}" when the player has 30+ points.
  - Yellow "{points}/30 points" when below the threshold.
- Reads from the sprocket schema (`sprocket.eligibility_data`) via `EligibilityService`.
- Fixed a pre-existing type bug where `players` in `CurrentUserResult` was typed as a single object instead of an array.

## Infrastructure & CI

### Dev Foundation & Deploy Pipeline
- **Dedicated dev manager**: Dev deploys now route to `foundation/dev-staging` instead of the shared pre-prod manager ([f4fe2730](https://github.com/SprocketBot/sprocket/commit/f4fe2730)).
- **Isolated dev layer stacks**: Dedicated dev layer stacks with configurable platform stack references ([a67bc288](https://github.com/SprocketBot/sprocket/commit/a67bc288)).
- **Foundation bootstrap gate**: Dev deploy workflow reconciles `foundation/dev-staging` before Swarm applies ([65786a9d](https://github.com/SprocketBot/sprocket/commit/65786a9d)).
- **SSH user support**: Dev CD can override the shared pre-prod SSH login ([630b72ad](https://github.com/SprocketBot/sprocket/commit/630b72ad)).
- **Fail-fast connectivity**: Docker access over SSH verified before Pulumi runs ([5065d382](https://github.com/SprocketBot/sprocket/commit/5065d382)).
- **Pre-deploy refresh**: Dev platform stack refreshed before preview and up in CI ([ff3493ee](https://github.com/SprocketBot/sprocket/commit/ff3493ee)).
- **SSH fingerprint fix**: Uses existing DigitalOcean SSH key fingerprint for dev-staging ([9993ec0f](https://github.com/SprocketBot/sprocket/commit/9993ec0f)).
- **Foundation gate lookup**: Dev foundation gate now runs from the foundation project directory ([d7a933e1](https://github.com/SprocketBot/sprocket/commit/d7a933e1)).
- **Bootstrap unblocked**: Dev-staging SSH key stored as plain config; firewall creation waits for droplet ([770a837c](https://github.com/SprocketBot/sprocket/commit/770a837c)).

### Platform Layer & Shared Cluster
- **Dgraph routing fix**: Platform layer Dgraph routing corrected ([97816789](https://github.com/SprocketBot/sprocket/commit/97816789), [9da5b813](https://github.com/SprocketBot/sprocket/commit/9da5b813), [c60db498](https://github.com/SprocketBot/sprocket/commit/c60db498)).
- **Lane-scoped Postgres**: Non-prod stacks use lane-specific Postgres role and database names to avoid collisions ([0300ea8b](https://github.com/SprocketBot/sprocket/commit/0300ea8b)).
- **Database ownership**: Lane-scoped databases created without transferring ownership; access granted instead for DigitalOcean Postgres compatibility ([6c5f6de3](https://github.com/SprocketBot/sprocket/commit/6c5f6de3)).
- **Stable Redis password**: Redis password configuration stabilized ([1b7d2007](https://github.com/SprocketBot/sprocket/commit/1b7d2007), [a8eace53](https://github.com/SprocketBot/sprocket/commit/a8eace53)).
- **Removed Grafana role provisioning**: Unused Grafana Postgres role no longer imported, unblocking prod layer_2 service recreation ([0c481f8d](https://github.com/SprocketBot/sprocket/commit/0c481f8d)).
- **Legacy Postgres cert config**: Hard-coded postgres CA Swarm config kept only on prod ([ca4e6058](https://github.com/SprocketBot/sprocket/commit/ca4e6058)).

### CI Workflow Improvements
- **Node 24 runtime**: All GitHub Actions workflows upgraded to Node 24 ([2185d232](https://github.com/SprocketBot/sprocket/commit/2185d232)).
- **Faster Pulumi deploys**: Deploy plans scoped to affected stacks; single runner reused ([2236a681](https://github.com/SprocketBot/sprocket/commit/2236a681)).
- **Pulumi stack re-encryption**: Dev platform secrets re-keyed for the new `platform/dev` stack ([8d8773fd](https://github.com/SprocketBot/sprocket/commit/8d8773fd)).

### ELO
- ELO service reinitialized ([d031f8e3](https://github.com/SprocketBot/sprocket/commit/d031f8e3), [1fa6fa03](https://github.com/SprocketBot/sprocket/commit/1fa6fa03)).
