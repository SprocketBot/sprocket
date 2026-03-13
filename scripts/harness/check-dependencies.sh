#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

harness_require_command curl

STEP_DIR="$(harness_prepare_step_dir "check-dependencies")"
TIMEOUT_SECONDS="${HARNESS_TIMEOUT_SECONDS:-15}"
EXPECTED_STATUSES="${HARNESS_EXPECTED_DEPENDENCY_STATUSES:-200,204,301,302,400,401,403}"
FAILURES=0
CHECK_COUNT=0
RESULTS_FILE="${STEP_DIR}/results.txt"

touch "${RESULTS_FILE}"

if [[ -n "${HARNESS_DEPENDENCY_URLS:-}" ]]; then
  while IFS= read -r ENTRY; do
    [[ -z "${ENTRY}" ]] && continue

    NAME="${ENTRY%%=*}"
    URL="${ENTRY#*=}"
    [[ "${NAME}" == "${URL}" ]] && continue

    SAFE_NAME="${NAME//[^A-Za-z0-9._-]/_}"
    HEADERS_FILE="${STEP_DIR}/${SAFE_NAME}-headers.txt"
    BODY_FILE="${STEP_DIR}/${SAFE_NAME}-body.txt"
    META="$(curl -sS --max-time "${TIMEOUT_SECONDS}" -D "${HEADERS_FILE}" -o "${BODY_FILE}" -w '%{http_code}|%{time_total}' "${URL}")"
    IFS='|' read -r STATUS TIME_TOTAL <<< "${META}"
    CHECK_COUNT=$((CHECK_COUNT + 1))

    if harness_status_allowed "${EXPECTED_STATUSES}" "${STATUS}"; then
      printf "%s|pass|url|%s|%s|%s\n" "${NAME}" "${URL}" "${STATUS}" "${TIME_TOTAL}" >> "${RESULTS_FILE}"
    else
      printf "%s|fail|url|%s|%s|%s\n" "${NAME}" "${URL}" "${STATUS}" "${TIME_TOTAL}" >> "${RESULTS_FILE}"
      FAILURES=$((FAILURES + 1))
    fi
  done < <(printf '%s\n' "${HARNESS_DEPENDENCY_URLS}" | tr ',' '\n')
fi

if [[ -n "${HARNESS_DEPENDENCY_MARKERS_FILE:-}" ]]; then
  while IFS='|' read -r NAME TARGET_FILE PATTERN; do
    [[ -z "${NAME}" ]] && continue
    [[ "${NAME}" == \#* ]] && continue

    CHECK_COUNT=$((CHECK_COUNT + 1))

    if [[ ! -f "${TARGET_FILE}" ]]; then
      printf "%s|fail|marker|%s|missing-file|%s\n" "${NAME}" "${TARGET_FILE}" "${PATTERN}" >> "${RESULTS_FILE}"
      FAILURES=$((FAILURES + 1))
      continue
    fi

    if grep -Fq "${PATTERN}" "${TARGET_FILE}"; then
      printf "%s|pass|marker|%s|found|%s\n" "${NAME}" "${TARGET_FILE}" "${PATTERN}" >> "${RESULTS_FILE}"
    else
      printf "%s|fail|marker|%s|missing-pattern|%s\n" "${NAME}" "${TARGET_FILE}" "${PATTERN}" >> "${RESULTS_FILE}"
      FAILURES=$((FAILURES + 1))
    fi
  done < "${HARNESS_DEPENDENCY_MARKERS_FILE}"
fi

if [[ "${CHECK_COUNT}" -eq 0 ]]; then
  printf "No dependency checks were configured. Set HARNESS_DEPENDENCY_URLS or HARNESS_DEPENDENCY_MARKERS_FILE.\n" >&2
  exit 1
fi

STATUS="pass"
if [[ "${FAILURES}" -gt 0 ]]; then
  STATUS="fail"
fi

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=${STATUS}" \
  "checks=${CHECK_COUNT}" \
  "failures=${FAILURES}" \
  "results_file=${RESULTS_FILE}"

if [[ "${FAILURES}" -gt 0 ]]; then
  printf "Dependency checks failed: %s of %s failed\n" "${FAILURES}" "${CHECK_COUNT}" >&2
  exit 1
fi

printf "check-dependencies passed (%s checks)\n" "${CHECK_COUNT}"
