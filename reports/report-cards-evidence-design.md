# Evidence Report Cards: Design Summary

## Goal
Expose scrim and match report cards via Evidence with public access. Users should be able to browse report cards by player and/or team. Scrims include **all** scrims. Matches include **one report card per series**.

## High-Level Flow
1. **Report cards are generated** today on `ScrimSaved` and `MatchSaved` events via `CoreEndpoint.GenerateReportCard`.
2. **Notification service persists a report-card asset record** after generation (new Core endpoint).
3. **Datasets** query the new `report_card_asset` table and enrich with Sprocket + MLEDB context.
4. **Evidence pages** filter and display report cards with public image URLs.

## Storage Model (Sprocket DB)
New table: `sprocket.report_card_asset`
- `id` (serial PK)
- `type` (`SCRIM` | `MATCH`)
- `sprocketId` (scrim_id or match_id)
- `legacyId` (mledb scrim/series id)
- `organizationId`
- `minioKey` (object key in public bucket; e.g., `series_report_cards/.../outputs/<id>.png`)
- `scrimUuid` (nullable, scrim UUID from matchmaking)
- `userIds` (int[]; populated for scrims)
- `franchiseIds` (int[]; populated for matches)
- `createdAt/updatedAt/deletedAt`

Uniqueness: `(type, sprocketId)`

## Core API
New Core endpoint:
- `UpsertReportCardAsset`
  - Input: `{ type, organizationId, sprocketId, legacyId, minioKey, scrimUuid?, userIds[], franchiseIds[] }`
  - Output: `{ success: boolean }`

Core service upserts on `(type, sprocketId)` to avoid duplicates if events are replayed.

## Notification Service Integration
- `ScrimSaved` flow:
  - generate report card
  - call `UpsertReportCardAsset` with:
    - `type = SCRIM`
    - `sprocketId = scrim.databaseIds.id`
    - `legacyId = scrim.databaseIds.legacyId`
    - `scrimUuid = scrim.id`
    - `userIds = scrim.players[].id`
- `MatchSaved` flow:
  - generate report card
  - call `UpsertReportCardAsset` with:
    - `type = MATCH`
    - `sprocketId = databaseIds.id`
    - `legacyId = databaseIds.legacyId`
    - `franchiseIds = [homeFranchiseId, awayFranchiseId]`

## Public Bucket
Report card images are stored in the existing image generation bucket. Infra will make this bucket publicly accessible (or expose via CDN). Evidence will build `report_card_url` as:

```
https://sprocket-image-gen-main-1.nyc3.digitaloceanspaces.com/<minioKey>
```

The datasets default to this URL but allow overrides via the Postgres setting
`app.report_cards_base_url` for environment-specific configuration.

## Datasets (sprocketbot/datasets)
Two public datasets (one row per report-card *player* for filtering):

### `report_cards/scrim_report_cards`
- Source: `sprocket.report_card_asset` where `type='SCRIM'`
- Enrichment:
  - `sprocket.member` + `sprocket.member_profile` for player name
  - `mledb.scrim` + `mledb.series` for league/mode/type
- Output columns:
  - report_card_id, scrim_id, legacy_scrim_id, scrim_uuid
  - organization_id, generated_at
  - user_id, player_name
  - league, scrim_mode, scrim_type
  - report_card_url

### `report_cards/match_report_cards`
- Source: `sprocket.report_card_asset` where `type='MATCH'`
- Enrichment:
  - `mledb.series` + `mledb.fixture` for home/away teams, league, mode
  - `mledb.series_replay` + `mledb.player_stats_core` + `mledb.player` for players
- Output columns:
  - report_card_id, match_id, legacy_series_id
  - organization_id, generated_at
  - home_team, away_team, league, game_mode
  - player_name
  - report_card_url

## Evidence Pages
New pages:
- `/report_cards/scrims`
- `/report_cards/matches`

Each page:
- Dropdown filters for player + league + mode (and team for matches)
- Query groups by report_card_id to avoid duplicates
- Grid of cards that links to the full PNG

## Backfill (Optional)
Once the table is live, a one-time backfill can be run by:
- selecting all existing scrim/match report card images in the bucket
- resolving their legacy ids
- upserting into `report_card_asset`

This is optional; new cards will be indexed automatically.

## Future Enhancement: Match Report Cards with Sprocket User IDs
Right now match report cards use MLEDB player names because the generation event does not include a reliable list of Sprocket user IDs for the series. To add Sprocket user IDs at generation time:
- After `MatchSaved`, resolve the MLEDB players for the series:
  - `mledb.series_replay` → `mledb.player_stats_core` → `mledb.player`
- Map each MLEDB player to Sprocket players:
  - `mledb_bridge.player_to_player` (mledPlayerId → sprocketPlayerId)
  - `sprocket.player` → `sprocket.member` → `sprocket.member.userId`
- Deduplicate the resulting Sprocket user IDs and include them in `UpsertReportCardAsset` for `MATCH` assets.

This can be added later without changing the datasets, since the dataset can pull from either the `userIds` array or the existing MLEDB-derived player name list.

## Summary of Infra Changes
- Make the image generation bucket public (or front it with a public CDN).
- Ensure the public URL prefix matches the datasets’ `report_card_url` construction.
