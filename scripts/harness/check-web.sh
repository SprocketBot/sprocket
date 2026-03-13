#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

harness_require_command curl
harness_require_env HARNESS_WEB_URL

STEP_DIR="$(harness_prepare_step_dir "check-web")"
TIMEOUT_SECONDS="${HARNESS_TIMEOUT_SECONDS:-20}"
EXPECTED_STATUSES="${HARNESS_EXPECTED_WEB_STATUSES:-200,302}"
FOLLOW_REDIRECTS="${HARNESS_FOLLOW_REDIRECTS:-true}"
EXPECTED_MARKER="${HARNESS_EXPECTED_WEB_MARKER:-}"

INITIAL_HEADERS="${STEP_DIR}/initial-headers.txt"
INITIAL_BODY="${STEP_DIR}/initial-body.txt"
INITIAL_META="$(curl -sS --max-time "${TIMEOUT_SECONDS}" -D "${INITIAL_HEADERS}" -o "${INITIAL_BODY}" -w '%{http_code}|%{time_total}|%{url_effective}' "${HARNESS_WEB_URL}")"
IFS='|' read -r INITIAL_STATUS INITIAL_TIME INITIAL_EFFECTIVE_URL <<< "${INITIAL_META}"

FINAL_STATUS="${INITIAL_STATUS}"
FINAL_TIME="${INITIAL_TIME}"
FINAL_EFFECTIVE_URL="${INITIAL_EFFECTIVE_URL}"
MARKER_BODY_FILE="${INITIAL_BODY}"

if [[ "${FOLLOW_REDIRECTS}" == "true" ]]; then
  FOLLOW_HEADERS="${STEP_DIR}/follow-headers.txt"
  FOLLOW_BODY="${STEP_DIR}/follow-body.txt"
  FOLLOW_META="$(curl -sS -L --max-time "${TIMEOUT_SECONDS}" -D "${FOLLOW_HEADERS}" -o "${FOLLOW_BODY}" -w '%{http_code}|%{time_total}|%{url_effective}' "${HARNESS_WEB_URL}")"
  IFS='|' read -r FOLLOW_STATUS FOLLOW_TIME FOLLOW_EFFECTIVE_URL <<< "${FOLLOW_META}"

  FINAL_STATUS="${FOLLOW_STATUS}"
  FINAL_TIME="${FOLLOW_TIME}"
  FINAL_EFFECTIVE_URL="${FOLLOW_EFFECTIVE_URL}"
  MARKER_BODY_FILE="${FOLLOW_BODY}"
fi

STATUS_OK=false
if harness_status_allowed "${EXPECTED_STATUSES}" "${INITIAL_STATUS}"; then
  STATUS_OK=true
fi

if harness_status_allowed "${EXPECTED_STATUSES}" "${FINAL_STATUS}"; then
  STATUS_OK=true
fi

if [[ "${STATUS_OK}" != "true" ]]; then
  harness_write_summary "${STEP_DIR}/summary.txt" \
    "status=fail" \
    "reason=unexpected_status" \
    "url=${HARNESS_WEB_URL}" \
    "initial_status=${INITIAL_STATUS}" \
    "final_status=${FINAL_STATUS}" \
    "expected_statuses=${EXPECTED_STATUSES}"
  printf "Web reachability failed: expected %s, got initial=%s final=%s\n" "${EXPECTED_STATUSES}" "${INITIAL_STATUS}" "${FINAL_STATUS}" >&2
  exit 1
fi

if [[ -n "${EXPECTED_MARKER}" ]] && ! grep -Fq "${EXPECTED_MARKER}" "${MARKER_BODY_FILE}"; then
  harness_write_summary "${STEP_DIR}/summary.txt" \
    "status=fail" \
    "reason=missing_marker" \
    "url=${HARNESS_WEB_URL}" \
    "expected_marker=${EXPECTED_MARKER}" \
    "initial_status=${INITIAL_STATUS}" \
    "final_status=${FINAL_STATUS}"
  printf "Web reachability failed: marker not found: %s\n" "${EXPECTED_MARKER}" >&2
  exit 1
fi

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=pass" \
  "url=${HARNESS_WEB_URL}" \
  "initial_status=${INITIAL_STATUS}" \
  "final_status=${FINAL_STATUS}" \
  "final_effective_url=${FINAL_EFFECTIVE_URL}" \
  "initial_time_seconds=${INITIAL_TIME}" \
  "final_time_seconds=${FINAL_TIME}" \
  "marker_checked=${EXPECTED_MARKER:-none}"

printf "check-web passed for %s (initial=%s final=%s)\n" "${HARNESS_WEB_URL}" "${INITIAL_STATUS}" "${FINAL_STATUS}"
