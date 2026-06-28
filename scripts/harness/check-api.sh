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
CHECK_CORS_PREFLIGHT="${HARNESS_CHECK_CORS_PREFLIGHT:-false}"
CORS_ORIGIN="${HARNESS_CORS_ORIGIN:-${HARNESS_WEB_URL:-}}"
API_URL="$(harness_normalize_url "${HARNESS_API_URL}")"

HEADERS_FILE="${STEP_DIR}/headers.txt"
BODY_FILE="${STEP_DIR}/body.txt"
PREFLIGHT_HEADERS_FILE="${STEP_DIR}/preflight-headers.txt"
PREFLIGHT_BODY_FILE="${STEP_DIR}/preflight-body.txt"

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

if [[ "${CHECK_CORS_PREFLIGHT}" == "true" && -n "${CORS_ORIGIN}" ]]; then
  CURL_ARGS+=(-H "Origin: ${CORS_ORIGIN}")
fi

if [[ -n "${HARNESS_API_BODY_FILE:-}" ]]; then
  CURL_ARGS+=(-H "Content-Type: ${CONTENT_TYPE}" --data-binary "@${HARNESS_API_BODY_FILE}")
elif [[ -n "${HARNESS_API_BODY:-}" ]]; then
  CURL_ARGS+=(-H "Content-Type: ${CONTENT_TYPE}" --data "${HARNESS_API_BODY}")
fi

CURL_ARGS+=("${API_URL}")
API_META="$(curl "${CURL_ARGS[@]}")"
IFS='|' read -r API_STATUS API_TIME API_EFFECTIVE_URL <<< "${API_META}"

if ! harness_status_allowed "${EXPECTED_STATUSES}" "${API_STATUS}"; then
  harness_write_summary "${STEP_DIR}/summary.txt" \
    "status=fail" \
    "reason=unexpected_status" \
    "url=${API_URL}" \
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
    "url=${API_URL}" \
    "method=${API_METHOD}" \
    "status_code=${API_STATUS}" \
    "expected_marker=${EXPECTED_MARKER}"
  printf "API reachability failed: marker not found: %s\n" "${EXPECTED_MARKER}" >&2
  exit 1
fi

if [[ "${CHECK_CORS_PREFLIGHT}" == "true" ]]; then
  if [[ -z "${CORS_ORIGIN}" ]]; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=missing_cors_origin" \
      "url=${API_URL}"
    printf "API CORS preflight failed: HARNESS_CORS_ORIGIN or HARNESS_WEB_URL is required\n" >&2
    exit 1
  fi

  if ! grep -Eiq "^access-control-allow-origin: ${CORS_ORIGIN//./\\.}\r?$" "${HEADERS_FILE}"; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=missing_cors_response_allow_origin" \
      "url=${API_URL}" \
      "origin=${CORS_ORIGIN}" \
      "status_code=${API_STATUS}"
    printf "API CORS response failed: missing access-control-allow-origin for %s\n" "${CORS_ORIGIN}" >&2
    exit 1
  fi

  PREFLIGHT_META="$(curl \
    -sS \
    --max-time "${TIMEOUT_SECONDS}" \
    -X OPTIONS \
    -H "Origin: ${CORS_ORIGIN}" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type,authorization" \
    -D "${PREFLIGHT_HEADERS_FILE}" \
    -o "${PREFLIGHT_BODY_FILE}" \
    -w '%{http_code}|%{time_total}|%{url_effective}' \
    "${API_URL}")"
  IFS='|' read -r PREFLIGHT_STATUS PREFLIGHT_TIME PREFLIGHT_EFFECTIVE_URL <<< "${PREFLIGHT_META}"

  if [[ "${PREFLIGHT_STATUS}" != "204" ]]; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=unexpected_cors_preflight_status" \
      "url=${API_URL}" \
      "origin=${CORS_ORIGIN}" \
      "status_code=${PREFLIGHT_STATUS}" \
      "expected_status=204"
    printf "API CORS preflight failed: expected 204, got %s\n" "${PREFLIGHT_STATUS}" >&2
    exit 1
  fi

  if ! grep -Eiq "^access-control-allow-origin: ${CORS_ORIGIN//./\\.}\r?$" "${PREFLIGHT_HEADERS_FILE}"; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=missing_cors_allow_origin" \
      "url=${API_URL}" \
      "origin=${CORS_ORIGIN}" \
      "status_code=${PREFLIGHT_STATUS}"
    printf "API CORS preflight failed: missing access-control-allow-origin for %s\n" "${CORS_ORIGIN}" >&2
    exit 1
  fi

  if ! grep -Eiq "^access-control-allow-headers: .*authorization" "${PREFLIGHT_HEADERS_FILE}"; then
    harness_write_summary "${STEP_DIR}/summary.txt" \
      "status=fail" \
      "reason=missing_cors_authorization_header" \
      "url=${API_URL}" \
      "origin=${CORS_ORIGIN}" \
      "status_code=${PREFLIGHT_STATUS}"
    printf "API CORS preflight failed: authorization is not allowed\n" >&2
    exit 1
  fi
fi

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=pass" \
  "url=${API_URL}" \
  "method=${API_METHOD}" \
  "status_code=${API_STATUS}" \
  "effective_url=${API_EFFECTIVE_URL}" \
  "time_seconds=${API_TIME}" \
  "cors_preflight_checked=${CHECK_CORS_PREFLIGHT}" \
  "cors_origin=${CORS_ORIGIN:-none}" \
  "marker_checked=${EXPECTED_MARKER:-none}"

printf "check-api passed for %s (%s %s)\n" "${API_URL}" "${API_METHOD}" "${API_STATUS}"
