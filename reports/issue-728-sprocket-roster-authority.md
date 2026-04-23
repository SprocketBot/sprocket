# Issue 728 — Sprocket as roster / staff / suspension read model

## Source of truth (current)

For **Rocket League** (`game.id === 7`), franchise-facing reads should use **Sprocket** first:

- **Active roster slot:** `sprocket.roster_slot` (player ↔ team ↔ `roster_role`), populated from MLE `player.team_name`, `player.league`, `player.role` via `RosterAuthorityService.syncFromMlePlayerId`.
- **Franchise staff / captain / FM:** `sprocket.franchise_staff_appointment`, `sprocket.franchise_leadership_appointment`, keyed by `member` and franchise, populated from MLE `team` staff columns and `mledb.team_to_captain`.
- **League suspension (lookup):** `mledb.player.suspended` remains the legacy field; `RosterAuthorityService.getLeagueSuspendedFromMle` exposes it for callers that need it until a first-class Sprocket column exists.

`FranchiseService.getPlayerFranchisesByUserId` **dual-reads**: it loads Sprocket and MLE (when an MLE player exists), then **merges by franchise id** so partial Sprocket projection cannot hide legacy-only franchises or staff roles. If there is no MLE row, Sprocket-only is returned.

Staff appointment replacement from MLE runs in a **single DB transaction** (delete RL staff/FM appointments for the member, then insert the computed replacement set) so a failure cannot leave the member with appointments wiped.

## Temporary legacy mirror

**MLE** (`mledb.player`, `mledb.team`, `mledb.team_to_captain`) is still written by existing flows (e.g. `PlayerService` rank moves, `forcePlayerToTeam`, bot-era paths). After each relevant `mledb.player` save, core runs `RosterAuthorityService.syncFromMlePlayerId` so Sprocket stays aligned.

**Removal checklist (when bot commands are retired):**

1. Stop writing MLE roster/staff/captain fields; drive `roster_slot` and appointments from Sprocket-native mutations only.
2. Drop the post-save `syncFromMlePlayerId` hooks from `PlayerService` once MLE is no longer authoritative.
3. Remove the MLE fallback branch in `FranchiseService.getPlayerFranchisesByUserId`.
4. Add a Sprocket-native suspension field (or extend member restrictions) and migrate `suspended` reads off MLE.

## Relevant code

- `core/src/franchise/roster-authority.service.ts` — sync + Sprocket franchise aggregation
- `core/src/franchise/player/player.service.ts` — triggers sync after MLE player saves
- `core/src/franchise/franchise/franchise.service.ts` — prefers Sprocket for `GetPlayerFranchises`
