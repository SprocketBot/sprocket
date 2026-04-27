# Changelog — datasets (April 13–26, 2026)

## TM Player Support ([PR #98](https://github.com/SprocketBot/datasets/pull/98))

- Changed `all_the_ids` queries from `INNER JOIN` to `LEFT JOIN` on MLEDB, so Trial Mode (TM) players without MLEDB entries are now included in dataset results.

## Report Cards Table (Apr 12)

- Added a new `report_cards` table to the public datasets, exposing player performance metrics for reporting and analytics.
- Updated `eligibility_data`, `leagues`, and `players` queries to align with the new report cards structure.

## Scrim Eligibility Logic Fix ([PR #92](https://github.com/SprocketBot/datasets/pull/92))

- Fixed the scrim eligibility window calculation: the logic now finds the current Monday first, then looks back 30 days (previously it looked back 30 days first, then found the Monday — which produced inconsistent windows).

## Timezone & Timestamp Fixes ([PR #90](https://github.com/SprocketBot/datasets/pull/90), [PR #91](https://github.com/SprocketBot/datasets/pull/91))

- Fixed `NOW()` timezone conversion in the eligibility dataset to match the fix applied in the players dataset.
- Resolved timestamp drift issues that caused eligibility dates to shift unexpectedly.
