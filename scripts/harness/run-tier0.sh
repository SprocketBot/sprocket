#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

PROFILE_PATH="${1:-${HARNESS_PROFILE:-}}"

if [[ -z "${PROFILE_PATH}" ]]; then
  printf "Usage: %s <profile-env-file>\n" "${BASH_SOURCE[0]}" >&2
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

export HARNESS_RUN_ID="${HARNESS_RUN_ID:-$(date -u +"%Y%m%dT%H%M%SZ")}"

printf "Running Tier 0 harness for %s using %s\n" "${HARNESS_ENV_NAME:-unknown}" "${PROFILE_PATH}"

bash "${SCRIPT_DIR}/check-web.sh"
bash "${SCRIPT_DIR}/check-api.sh"
bash "${SCRIPT_DIR}/check-dependencies.sh"

RUN_DIR="$(harness_artifact_root)/$(harness_env_name)/$(harness_run_id)"
printf "Tier 0 complete. Artifacts: %s\n" "${RUN_DIR}"
