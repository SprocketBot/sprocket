# MLEDB to Sprocket Readiness Assessment

## Executive Summary

Sprocket is not ready for a full MLEDB retirement migration.

The Sprocket schema has usable equivalents for the league-core slice already covered by `queries/migration/mledb-migration.sql`: organization structure, franchises, skill groups, users, members, players, seasons, weeks, fixtures, and matches. `core/` also has services/resolvers/controllers for most of that slice.

The rest of MLEDB is mixed:

- Some concepts have Sprocket tables but no backfill or no first-class core service surface.
- Some concepts still depend on legacy `core/src/mledb/*` service code after partial Sprocket writes.
- Some concepts have no clear semantic target in Sprocket at all.

The practical conclusion is that we can rehearse and validate a league-core migration now, but we cannot migrate all MLEDB data and expect the application to use it without more schema mapping and service work.

## Readiness Categories

- `Ready`: Sprocket has a semantic target and core has usable service/resolver/controller paths.
- `Partial`: Sprocket has a likely target, but data fidelity, backfill, or service coverage is incomplete.
- `Legacy-dependent`: Sprocket has some target path, but current core workflows still read/write MLEDB for the behavior.
- `Not ready`: no clear Sprocket semantic target or no usable core path.

## Table-Level Assessment

| MLEDB table | Sprocket equivalent | Core service readiness | Status | Evidence |
|---|---|---|---|---|
| `division` | `franchise_group`, `franchise_group_profile`, `franchise_group_type` | Readable through franchise graph population; no dedicated division CRUD service. | Partial | Migration validates name/conference. Core has `FranchiseService`, but no direct franchise-group service surface. |
| `team` | `franchise`, `franchise_profile`, `team`, staff/leadership appointments, roster slots | Franchise/team reads exist; roster/staff sync still consumes MLEDB team rows. | Legacy-dependent | `RosterAuthorityService` injects `MLE_Team`, `MLE_TeamToCaptain`, bridge tables, roster slots, and appointments. |
| `team_branding` | `franchise_profile`, `photo`, webhook fields | Franchise profile exists; logo/photo and webhook mapping are incomplete in migration validation. | Partial | Migration validates code/colors; current validation does not prove photo/logo equivalence. |
| `league_branding` | `game_skill_group_profile`, `photo` | Skill-group services exist; no backfill/validation for color, badge, or emoji from `league_branding`. | Partial | `GameSkillGroupProfile` has `color`, `photo`, and `discordEmojiId`; migration seeds hard-coded profile values instead of using `mledb.league_branding`. |
| `salary_cap` | `game_skill_group.salaryCap` | Skill-group read services exist; no per-row historical salary-cap mapping. | Partial | Sprocket stores one salary cap per skill group, while MLEDB table is league keyed. |
| `player` | `user`, `user_profile`, `user_authentication_account`, `member`, `member_profile`, `player` | Strong service coverage, but player write paths still mirror into MLEDB. | Legacy-dependent | `PlayerService` creates/updates Sprocket rows and also calls `mle_createPlayer`, `mle_updatePlayer`, and MLEDB account mirrors. |
| `player_account` | `member_platform_account` plus `platform` | Sprocket service exists; cutover still falls back to and mirrors MLEDB player accounts. | Legacy-dependent | `MemberPlatformAccountService` exists; `MledbPlayerAccountService` is explicitly documented as a legacy mirror. |
| `player_to_org` | `user_org_team_permission` | Dedicated service and resolution path exist, with dual-read migration behavior. | Partial | Prior org-team dual-read work covers this, but stale legacy grants and flag-off discipline remain required before retirement. |
| `player_history` | no clear equivalent | No Sprocket history/audit model for player profile, team, salary, league, suspension history. | Not ready | Only current-state `player`/`member`/profile models are present. |
| `team_to_captain` | `franchise_staff_appointment`, `roster_slot`, `roster_role` | Sync logic exists, but it is driven from MLEDB captain rows. | Legacy-dependent | `RosterAuthorityService` reads `MLE_TeamToCaptain` to create Sprocket appointments. |
| `draft_order` | `draft_pick`, `draft_selection` | Database entities exist; no core service/resolver/controller outside database module. | Partial | `core/src/database/draft/*` exists, but no `core/src/draft/*` application service exists. |
| `season` | `schedule_group` with type `SEASON` | Service exists and creates both Sprocket and MLEDB rows today. | Legacy-dependent | `ScheduleGroupService` injects `ScheduleGroup`, `MLE_Season`, and bridge rows. |
| `match` | `schedule_group` with type `WEEK` | Service exists and creates both Sprocket and MLEDB rows today. | Legacy-dependent | `ScheduleGroupService` injects `MLE_Match` and `MatchToScheduleGroup`. |
| `fixture` | `schedule_fixture` | Service/resolver exist, but create path still writes MLEDB fixture/series bridge data. | Legacy-dependent | `ScheduleFixtureService` injects `ScheduleFixture`, `MLE_Fixture`, `MLE_Series`, and bridge repos. |
| `series` | `match_parent`, `match`, `scheduled_event` for event-like series | Match service/resolver exist; match operations still bridge to MLEDB series/replays for some mutations. | Legacy-dependent | `MatchResolver` injects `MLE_Series`, `MLE_SeriesReplay`, and `SeriesToMatchParent`. |
| `series_replay` | `round` plus `round.roundStats`, `player_stat_line`, `team_stat_line` | Sprocket finalization writes rounds/stat lines; legacy match/finalization code still uses `MLE_SeriesReplay`. | Legacy-dependent | Rocket League finalization inserts Sprocket `Round`, `TeamStatLine`, and `PlayerStatLine`; MLEDB finalization still inserts MLEDB replays. |
| `player_stats_core` | `player_stat_line.stats` JSON core stats | Finalization writes Sprocket stat lines; no historical backfill/semantic validator exists. | Partial | Sprocket stores JSON stats rather than typed columns; consumers must parse schema. |
| `player_stats` | `player_stat_line.stats` JSON extended stats | Same as above; possible target exists but not typed or validated. | Partial | `PlayerStatLine` has a JSON `stats` field; `PlayerStatLineStatsSchema` covers expected runtime shape only. |
| `team_core_stats` | `team_stat_line.stats` JSON | Same as above; possible target exists but not typed or validated. | Partial | `TeamStatLine` has a JSON `stats` field; no migration equivalence query exists. |
| `team_role_usage` | `roster_role_usage` | Service exists for NCP input, but it writes both MLEDB and Sprocket and skips Sprocket rows when roster mapping is missing. | Legacy-dependent | `MledbNcpTeamRoleUsageService` creates `MLE_TeamRoleUsage` and `RosterRoleUsage`. |
| `scrim` | `scrim_meta`, `match_parent`, scrim module types | Sprocket scrim service exists, but migration of historical MLEDB scrims is not mapped. | Partial | `ScrimMeta` is minimal (`isCompetitive` + parent); MLEDB has mode/type/base points/author/host. |
| `eligibility_data` | `eligibility_data` | Service exists for Sprocket eligibility calculations; no MLEDB backfill mapping yet. | Partial | `EligibilityService` reads Sprocket `EligibilityData`; MLEDB finalization still writes `MLE_EligibilityData`. |
| `elo_data` | no durable Sprocket table; external connector/materialized MLEDB view | Core Elo service still reads `mledb.v_current_elo_values`; connector can calculate external Elo jobs. | Not ready | `EloService` refreshes/selects from MLEDB materialized view and has a TODO to match Sprocket skill group codes. |
| `psyonix_api_result` | no clear equivalent | No Sprocket service or model for historical Psyonix API rank snapshots. | Not ready | Only MLEDB model references were found. |
| `channel_map` | possibly `webhook`, organization config, or profile webhook fields | No direct Sprocket channel-map model or core service. | Not ready | `Webhook` stores URLs, not Discord channel IDs by channel type. |
| `stream_event` | possibly `scheduled_event` | `ScheduledEvent` exists as a model; no service/resolver/controller and no stream-specific mapping. | Partial | Model has description/start/url/host/game/matches, but no application service was found. |
| `config` | `sprocket_configuration` or `organization_configuration_*` | Services exist, but key-by-key semantic mapping from MLEDB config is absent. | Partial | Configuration services support Sprocket config and org config, but MLEDB config keys are not mapped. |
| `footers` | possibly `verbiage` | Verbiage service exists, but footer semantics and codes are not mapped. | Partial | `Verbiage` is code/organization/term; `footers` is free text rows. |

## Service-Code Findings

The strongest Sprocket-native areas are:

- identity/user/member/profile CRUD and GraphQL/RPC surfaces,
- organization/franchise/player/game/skill-group reads and writes,
- schedule group, schedule fixture, match, round, scrim, eligibility, and report-card operational paths,
- Sprocket configuration and organization configuration reads/writes.

The weakest areas are:

- draft data: database entities exist but no core application service was found,
- stream events: database entity exists but no core application service was found,
- historical player state: no Sprocket target equivalent was found,
- Elo history/current values: still MLEDB-view-driven from `core/src/elo/elo.service.ts`,
- Psyonix rank snapshots: no Sprocket target equivalent was found,
- typed/statistical historical replay data: Sprocket stores JSON stat lines, but there is no backfill or semantic validator for MLEDB stat columns.

The major cutover risk is not just schema coverage; it is that several active write paths are dual-write or legacy-driven:

- player create/update mirrors into `mledb.player` and `mledb.player_account`,
- schedule creation writes `mledb.season`, `mledb.match`, `mledb.fixture`, and `mledb.series`,
- roster authority uses MLEDB team/captain rows as input,
- match mutations still read/write MLEDB series/replay rows,
- NCP role usage writes both MLEDB and Sprocket rows.

## Blocking Gaps Before Full Migration

1. Define authoritative target mappings for every `Partial`, `Legacy-dependent`, and `Not ready` row above.
2. Decide whether historical-only MLEDB tables should be migrated to Sprocket, archived read-only, or intentionally dropped.
3. Replace legacy-driven write paths with Sprocket-authoritative services before disabling MLEDB writes.
4. Add backfills and semantic validators for stats, scrims, draft order, player accounts, role usage, staff/captain roles, eligibility, configuration, webhooks/channel routing, and stream/scheduled events.
5. Build a post-migration runtime smoke plan that exercises the Sprocket-native service paths without MLEDB fallback.

## Recommended Sequence

1. Treat the current PR as a league-core rehearsal tool, not a full-MLEDB retirement tool.
2. Add one migration slice at a time for deferred domains, starting with platform accounts, roster/staff/captains, and role usage because active core workflows already straddle those domains.
3. Move schedule/match/player write paths to Sprocket-authoritative behavior behind flags, then validate they no longer require MLEDB writes.
4. Decide the retention strategy for player history, Elo history, Psyonix snapshots, and full replay/stat history before attempting bulk migration.
5. Only after the above, run the guardrail workflow against a production dump and require zero semantic issues plus zero changed/deleted pre-existing Sprocket rows.
