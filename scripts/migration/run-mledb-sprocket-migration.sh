#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_DIR="$ROOT_DIR/queries/migration/mledb-sprocket"
LEGACY_BACKFILL_SQL="$ROOT_DIR/queries/migration/mledb-migration.sql"
ARTIFACT_DIR="$ROOT_DIR/artifacts/mledb-sprocket-migration"

usage() {
  cat <<'USAGE'
Usage:
  scripts/migration/run-mledb-sprocket-migration.sh --database-url URL --step STEP [options]

Steps:
  preflight          Run read-only readiness checks.
  baseline           Capture hashes for all existing sprocket rows.
  coverage           Show the migration coverage classification for every known mledb table.
  legacy-backfill    Execute queries/migration/mledb-migration.sql. Requires --allow-legacy-backfill.
  validate           Validate Sprocket row preservation and MLEDB semantic equivalence.
  rollback           Delete rows reachable through mledb_bridge. Requires --confirm-rollback DELETE_MIGRATED_ROWS.
  all                Run preflight, coverage, baseline, legacy-backfill, validate.

Options:
  --database-url URL              Postgres connection string. Can also use DATABASE_URL.
  --run-id UUID                   Migration guard run id. Defaults to uuidgen output.
  --description TEXT              Stored with the baseline run.
  --artifact-dir PATH             Directory for command logs.
  --allow-legacy-backfill         Required for legacy-backfill/all.
  --confirm-rollback TEXT         Must be DELETE_MIGRATED_ROWS for rollback.
  --help                         Show this help.
USAGE
}

database_url="${DATABASE_URL:-}"
step=""
run_id="${MIGRATION_RUN_ID:-}"
description="mledb to sprocket migration"
allow_legacy_backfill=0
confirm_rollback=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --database-url)
      database_url="${2:?missing value for --database-url}"
      shift 2
      ;;
    --step)
      step="${2:?missing value for --step}"
      shift 2
      ;;
    --run-id)
      run_id="${2:?missing value for --run-id}"
      shift 2
      ;;
    --description)
      description="${2:?missing value for --description}"
      shift 2
      ;;
    --artifact-dir)
      ARTIFACT_DIR="${2:?missing value for --artifact-dir}"
      shift 2
      ;;
    --allow-legacy-backfill)
      allow_legacy_backfill=1
      shift
      ;;
    --confirm-rollback)
      confirm_rollback="${2:?missing value for --confirm-rollback}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$database_url" ]]; then
  echo "missing --database-url or DATABASE_URL" >&2
  exit 2
fi

if [[ -z "$step" ]]; then
  echo "missing --step" >&2
  usage >&2
  exit 2
fi

if [[ -z "$run_id" ]]; then
  run_id="$(uuidgen | tr '[:upper:]' '[:lower:]')"
fi

git_sha="$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || true)"
mkdir -p "$ARTIFACT_DIR/$run_id"

run_psql() {
  local name="$1"
  local file="$2"
  shift 2

  local log_file="$ARTIFACT_DIR/$run_id/${name}.log"
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] running $name -> $log_file"
  psql "$database_url" \
    --set ON_ERROR_STOP=1 \
    --set "migration_run_id=$run_id" \
    --set "migration_description=$description" \
    --set "migration_git_sha=$git_sha" \
    "$@" \
    --file "$file" \
    2>&1 | tee "$log_file"
}

run_preflight() {
  run_psql preflight "$SQL_DIR/01_preflight.sql"
}

run_baseline() {
  run_psql baseline "$SQL_DIR/02_capture_baseline.sql"
}

run_coverage() {
  run_psql coverage "$SQL_DIR/04_domain_coverage.sql"
}

run_legacy_backfill() {
  if [[ "$allow_legacy_backfill" -ne 1 ]]; then
    echo "legacy-backfill requires --allow-legacy-backfill because the current SQL is not idempotent" >&2
    exit 2
  fi

  run_psql legacy-backfill "$LEGACY_BACKFILL_SQL"
}

run_validate() {
  run_psql validate "$SQL_DIR/03_validate_equivalence.sql"
}

run_rollback() {
  if [[ "$confirm_rollback" != "DELETE_MIGRATED_ROWS" ]]; then
    echo "rollback requires --confirm-rollback DELETE_MIGRATED_ROWS" >&2
    exit 2
  fi

  run_psql rollback "$SQL_DIR/90_rollback_bridge_mapped_rows.sql" \
    --set "confirm_rollback=$confirm_rollback"
}

case "$step" in
  preflight)
    run_preflight
    ;;
  baseline)
    run_baseline
    ;;
  coverage)
    run_coverage
    ;;
  legacy-backfill)
    run_legacy_backfill
    ;;
  validate)
    run_validate
    ;;
  rollback)
    run_rollback
    ;;
  all)
    run_preflight
    run_coverage
    run_baseline
    run_legacy_backfill
    run_validate
    ;;
  *)
    echo "unknown step: $step" >&2
    usage >&2
    exit 2
    ;;
esac

echo "migration_run_id=$run_id"
echo "artifacts=$ARTIFACT_DIR/$run_id"
