#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

harness_require_command curl
harness_require_env HARNESS_API_URL

STEP_DIR="$(harness_prepare_step_dir "check-api")"
TIMEOUT_SECONDS="${HARNESS_TIMEOUT_SECONDS:-20}"
EXPECTED_STATUSES="${HARNESS_EXPECTED_API_STATUSES:-200,400,401,403,405}"
API_METHOD="${HARNESS_API_METHOD:-GET}"
EXPECTED_MARKER="${HARNESS_EXPECTED_API_MARKER:-}"
CONTENT_TYPE="${HARNESS_CONTENT_TYPE:-application/json}"
AUTH_HEADER="${HARNESS_AUTH_HEADER:-}"

HEADERS_FILE="${STEP_DIR}/headers.txt"
BODY_FILE="${STEP_DIR}/body.txt"

CURL_ARGS=(
  -sS
  --max-time "${TIMEOUT_SECONDS}"
  -X "${API_METHOD}"
  -D "${HEADERS_FILE}"
  -o "${BODY_FILE}"
  -w '%{http_code}|%{time_total}|%{url_effective}'
)

if [[ -n "${AUTH_HEADER}" ]]; then
  CURL_ARGS+=(-H "${AUTH_HEADER}")
fi

if [[ -n "${HARNESS_API_BODY_FILE:-}" ]]; then
  CURL_ARGS+=(-H "Content-Type: ${CONTENT_TYPE}" --data-binary "@${HARNESS_API_BODY_FILE}")
elif [[ -n "${HARNESS_API_BODY:-}" ]]; then
  CURL_ARGS+=(-H "Content-Type: ${CONTENT_TYPE}" --data "${HARNESS_API_BODY}")
fi

CURL_ARGS+=("${HARNESS_API_URL}")
API_META="$(curl "${CURL_ARGS[@]}")"
IFS='|' read -r API_STATUS API_TIME API_EFFECTIVE_URL <<< "${API_META}"

if ! harness_status_allowed "${EXPECTED_STATUSES}" "${API_STATUS}"; then
  harness_write_summary "${STEP_DIR}/summary.txt" \
    "status=fail" \
    "reason=unexpected_status" \
    "url=${HARNESS_API_URL}" \
    "method=${API_METHOD}" \
    "status_code=${API_STATUS}" \
    "expected_statuses=${EXPECTED_STATUSES}"
  printf "API reachability failed: expected %s, got %s\n" "${EXPECTED_STATUSES}" "${API_STATUS}" >&2
  exit 1
fi

if [[ -n "${EXPECTED_MARKER}" ]] && ! grep -Fq "${EXPECTED_MARKER}" "${BODY_FILE}"; then
  harness_write_summary "${STEP_DIR}/summary.txt" \
    "status=fail" \
    "reason=missing_marker" \
    "url=${HARNESS_API_URL}" \
    "method=${API_METHOD}" \
    "status_code=${API_STATUS}" \
    "expected_marker=${EXPECTED_MARKER}"
  printf "API reachability failed: marker not found: %s\n" "${EXPECTED_MARKER}" >&2
  exit 1
fi

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=pass" \
  "url=${HARNESS_API_URL}" \
  "method=${API_METHOD}" \
  "status_code=${API_STATUS}" \
  "effective_url=${API_EFFECTIVE_URL}" \
  "time_seconds=${API_TIME}" \
  "marker_checked=${EXPECTED_MARKER:-none}"

printf "check-api passed for %s (%s %s)\n" "${HARNESS_API_URL}" "${API_METHOD}" "${API_STATUS}"
