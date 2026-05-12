# MLEDB to Sprocket Migration Validation Plan

This plan is the operating contract for beginning the MLEDB schema to Sprocket schema migration. The current legacy backfill SQL is still `queries/migration/mledb-migration.sql`; the new guardrail tooling makes each run auditable before it is trusted.

## Goals

1. Prove every migrated MLEDB domain row has a semantically equivalent Sprocket row.
2. Prove every Sprocket row that existed before the run still exists and has not changed.
3. Keep a run-scoped artifact trail that can be reviewed after failed or successful runs.
4. Provide a rollback path for rows inserted through `mledb_bridge`, while treating any mutation of pre-existing Sprocket rows as a restore-from-backup event.

## Runbook

Use a restored clone of production first. Do not run the legacy backfill on production until the same source dump has a clean validation run on a disposable database.

```bash
export DATABASE_URL='postgres://...'
scripts/migration/run-mledb-sprocket-migration.sh --step preflight --database-url "$DATABASE_URL"
scripts/migration/run-mledb-sprocket-migration.sh --step coverage --database-url "$DATABASE_URL"

RUN_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"
scripts/migration/run-mledb-sprocket-migration.sh --step baseline --run-id "$RUN_ID" --database-url "$DATABASE_URL"

scripts/migration/run-mledb-sprocket-migration.sh \
  --step legacy-backfill \
  --run-id "$RUN_ID" \
  --database-url "$DATABASE_URL" \
  --allow-legacy-backfill

scripts/migration/run-mledb-sprocket-migration.sh --step validate --run-id "$RUN_ID" --database-url "$DATABASE_URL"
```

The runner writes logs under `artifacts/mledb-sprocket-migration/<run-id>/`.

## Validation Gates

Preflight must have zero blockers:

- Required `mledb`, `mledb_bridge`, and `sprocket` schemas and tables exist.
- MLEDB player identity inputs are unique where Sprocket uniqueness requires it.
- Fixtures reference known teams.
- Migrated series use supported leagues and game modes.
- Bridge tables are reported if they are not empty before a run.

Domain coverage must have zero manifest issues:

- Every live `mledb` base table must appear in `04_domain_coverage.sql`.
- Every manifest entry must point at a live `mledb` base table.
- `validated` means covered by `03_validate_equivalence.sql`.
- `validated-separately` means covered by a separate backfill/audit path.
- `deferred` means intentionally not covered by the current league-core migration and cannot be claimed as migrated until a target mapping and validation gate are added.

Baseline preservation must have zero issues:

- `migration_guard.capture_sprocket_baseline` stores every existing Sprocket table count/hash.
- For tables with primary keys, it stores every pre-existing row key and JSON row hash.
- `migration_guard.validate_sprocket_baseline` fails if any pre-existing row is deleted or changed.
- Tables without primary keys are protected by whole-table count/hash comparison.

Semantic equivalence must have zero issues:

- `mledb.division` to Sprocket franchise groups by name and conference.
- `mledb.team` and `mledb.team_branding` to Sprocket franchise profiles by title/code/colors.
- `mledb.player` to Sprocket user, Discord auth account, and member rows by name and account id.
- Supported-league `mledb.player` rows to Sprocket player rows by league and salary.
- `mledb.season` to Sprocket season schedule groups by dates and description.
- `mledb.fixture` to Sprocket schedule fixtures by week and home/away franchises.
- `mledb.series` to Sprocket match parent/match rows by fixture, league, and game mode.
- Every bridge table used for validation must be one-to-one on source and target keys.

## Error Handling

Stop immediately on any failed step. Do not proceed from a failed preflight into baseline or backfill; do not proceed from a failed validation into cutover.

Classify failures this way:

- Preflight blocker: fix source data, schema state, or the migration SQL before backfill.
- Baseline preservation issue: assume existing Sprocket data was changed or deleted. Use a database restore or point-in-time recovery; do not use bridge-row rollback as the only recovery.
- Semantic mismatch: inspect the row payloads emitted by `03_validate_equivalence.sql`, patch the backfill mapping, restore the disposable DB, and rerun from preflight.
- Non-empty bridge warning: either use a fresh restored database or intentionally validate the prior bridge state before reusing it.

## Rollback

The preferred rollback for a failed rehearsal is to drop and recreate the disposable database from the source dump.

For a production-like environment where only migrated rows need to be removed, use:

```bash
scripts/migration/run-mledb-sprocket-migration.sh \
  --step rollback \
  --run-id "$RUN_ID" \
  --database-url "$DATABASE_URL" \
  --confirm-rollback DELETE_MIGRATED_ROWS
```

Rollback deletes only rows reachable through `mledb_bridge`, in dependency order, and then clears bridge rows. It is not a substitute for restore/PITR if validation reports changed or deleted pre-existing Sprocket rows.

## Promotion Criteria

A migration run can be promoted only when the artifact directory contains passing logs for `preflight`, `baseline`, `legacy-backfill`, and `validate` for the exact dump or database snapshot being promoted. The validation log must show zero rows in `migration_validation_issues`, and the run id must be recorded in the deployment notes.
