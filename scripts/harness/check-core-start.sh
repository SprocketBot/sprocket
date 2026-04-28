#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

STEP_DIR="$(harness_prepare_step_dir "check-core-start")"
REPO_ROOT="$(harness_repo_root)"
LOG_FILE="${STEP_DIR}/core-start.log"
TIMEOUT_SECONDS="${HARNESS_CORE_START_TIMEOUT_SECONDS:-90}"
STARTUP_MARKER="${HARNESS_CORE_START_MARKER:-GraphQL Playground available}"
CORE_COMMAND="${HARNESS_CORE_START_COMMAND:-npm run dev --workspace=core}"

PID=""
cleanup() {
  if [[ -n "${PID}" ]] && kill -0 "${PID}" >/dev/null 2>&1; then
    kill "${PID}" >/dev/null 2>&1 || true
    wait "${PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

printf "Starting core with command: %s\n" "${CORE_COMMAND}" > "${LOG_FILE}"
(
  cd "${REPO_ROOT}"
  bash -lc "${CORE_COMMAND}"
) >> "${LOG_FILE}" 2>&1 &
PID="$!"

DEADLINE=$((SECONDS + TIMEOUT_SECONDS))
while [[ "${SECONDS}" -lt "${DEADLINE}" ]]; do
  if grep -Fq "${STARTUP_MARKER}" "${LOG_FILE}"; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=pass" \
      "command=${CORE_COMMAND}" \
      "startup_marker=${STARTUP_MARKER}" \
      "timeout_seconds=${TIMEOUT_SECONDS}" \
      "log_file=${LOG_FILE}"
    printf "check-core-start passed; marker found: %s\n" "${STARTUP_MARKER}"
    exit 0
  fi

  if ! kill -0 "${PID}" >/dev/null 2>&1; then
    wait "${PID}" || EXIT_CODE="$?"
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=process_exited_before_startup_marker" \
      "exit_code=${EXIT_CODE:-unknown}" \
      "command=${CORE_COMMAND}" \
      "startup_marker=${STARTUP_MARKER}" \
      "log_file=${LOG_FILE}"
    printf "Core startup failed before marker was found. See %s\n" "${LOG_FILE}" >&2
    exit 1
  fi

  sleep 2
done

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=fail" \
  "reason=timeout_waiting_for_startup_marker" \
  "command=${CORE_COMMAND}" \
  "startup_marker=${STARTUP_MARKER}" \
  "timeout_seconds=${TIMEOUT_SECONDS}" \
  "log_file=${LOG_FILE}"
printf "Core startup timed out after %s seconds waiting for marker: %s\n" "${TIMEOUT_SECONDS}" "${STARTUP_MARKER}" >&2
exit 1
