#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_PATH="${1:-${HARNESS_PROFILE:-}}"
SCENARIO="${2:-all}"

if [[ -z "${PROFILE_PATH}" ]]; then
  printf "Usage: %s <profile-env-file> [league|scrim|submission|all]\n" "${BASH_SOURCE[0]}" >&2
  exit 1
fi

if [[ "${PROFILE_PATH}" != /* ]]; then
  PROFILE_PATH="${SCRIPT_DIR}/${PROFILE_PATH}"
fi

if [[ ! -f "${PROFILE_PATH}" ]]; then
  printf "Harness profile not found: %s\n" "${PROFILE_PATH}" >&2
  exit 1
fi

set -a
source "${PROFILE_PATH}"
set +a

run_league() {
  node "${SCRIPT_DIR}/run-league-read-smoke.js"
}

run_scrim() {
  node "${SCRIPT_DIR}/run-scrim-lifecycle-smoke.js"
}

run_submission() {
  node "${SCRIPT_DIR}/run-replay-submission-smoke.js"
}

case "${SCENARIO}" in
  league)
    run_league
    ;;
  scrim)
    run_scrim
    ;;
  submission)
    run_submission
    ;;
  all)
    run_league
    run_scrim
    run_submission
    ;;
  *)
    printf "Unknown Tier 1 scenario: %s\n" "${SCENARIO}" >&2
    exit 1
    ;;
esac
