#!/usr/bin/env bash
#
# Synthetic canary: poll web + GraphQL endpoints for CANARY_DURATION_SEC.
# Fails on excess failures or high p95 latency (successful probes only).
#
# Required: STAGING_BASE_URL, STAGING_API_URL
# Optional: see infra/ci/README.md (#677)
#
set -euo pipefail

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'error: %s not found in PATH\n' "$1" >&2
    exit 1
  }
}

require_cmd curl

: "${STAGING_BASE_URL:?STAGING_BASE_URL is required (web origin, e.g. https://staging.app.sprocket.gg)}"
: "${STAGING_API_URL:?STAGING_API_URL is required (GraphQL URL, e.g. https://api.example.com/graphql)}"

CANARY_DURATION_SEC="${CANARY_DURATION_SEC:-600}"
CANARY_INTERVAL_SEC="${CANARY_INTERVAL_SEC:-60}"
CANARY_REQUEST_TIMEOUT_SEC="${CANARY_REQUEST_TIMEOUT_SEC:-25}"
CANARY_WEB_ALLOWED_STATUSES="${CANARY_WEB_ALLOWED_STATUSES:-200,204,302}"
CANARY_WEB_MAX_FAILURES="${CANARY_WEB_MAX_FAILURES:-2}"
CANARY_GRAPHQL_MAX_FAILURES="${CANARY_GRAPHQL_MAX_FAILURES:-2}"
CANARY_P95_LATENCY_MS_WEB="${CANARY_P95_LATENCY_MS_WEB:-8000}"
CANARY_P95_LATENCY_MS_API="${CANARY_P95_LATENCY_MS_API:-8000}"
CANARY_ARTIFACT_DIR="${CANARY_ARTIFACT_DIR:-artifacts/canary-run}"
CANARY_ONCE="${CANARY_ONCE:-false}"
if [[ -z "${CANARY_GRAPHQL_BODY:-}" ]]; then
  CANARY_GRAPHQL_BODY='{"query":"query CanaryPing { __typename }"}'
fi

mkdir -p "${CANARY_ARTIFACT_DIR}"
SUMMARY="${CANARY_ARTIFACT_DIR}/canary-summary.txt"
LOG="${CANARY_ARTIFACT_DIR}/canary.log"
WEB_TIMES_FILE="${CANARY_ARTIFACT_DIR}/web_times_ms.txt"
API_TIMES_FILE="${CANARY_ARTIFACT_DIR}/api_times_ms.txt"
: >"${WEB_TIMES_FILE}"
: >"${API_TIMES_FILE}"
: >"${LOG}"

# Never log auth material.
if [[ -n "${CANARY_AUTH_HEADER:-}" ]]; then
  printf 'note: CANARY_AUTH_HEADER is set (value not logged)\n' | tee -a "${LOG}"
fi

status_allowed() {
  local allowed_csv="$1"
  local code="$2"
  IFS=',' read -ra parts <<<"${allowed_csv}"
  local p
  for p in "${parts[@]}"; do
    if [[ "${code}" == "$(echo "${p}" | tr -d '[:space:]')" ]]; then
      return 0
    fi
  done
  return 1
}

graphql_ok() {
  local file="$1"
  [[ -s "${file}" ]] || return 1
  if grep -q '"errors"[[:space:]]*:[[:space:]]*\[[[:space:]]*{' "${file}"; then
    return 1
  fi
  grep -q '"__typename"' "${file}"
}

percentile95_ms() {
  local file="$1"
  if [[ ! -s "${file}" ]]; then
    printf '0\n'
    return
  fi
  sort -n "${file}" | awk '
    { a[NR] = $1 }
    END {
      if (NR == 0) { print 0; exit }
      k = int(0.95 * NR)
      if (k < 1) k = 1
      if (k > NR) k = NR
      print a[k]
    }'
}

probe_web() {
  local tmp_body status t_ms
  tmp_body="$(mktemp)"
  local meta
  meta="$(
    curl -sS -L --max-time "${CANARY_REQUEST_TIMEOUT_SEC}" \
      -o "${tmp_body}" -w '%{http_code}|%{time_total}' \
      "${STAGING_BASE_URL}/" 2>>"${LOG}" || true
  )"
  IFS='|' read -r status t_ms <<<"${meta}"
  status="${status:-000}"
  t_ms="${t_ms:-0}"
  rm -f "${tmp_body}"
  if status_allowed "${CANARY_WEB_ALLOWED_STATUSES}" "${status}"; then
    awk -v t="${t_ms}" 'BEGIN { printf "%.0f\n", t * 1000 }' >>"${WEB_TIMES_FILE}"
    printf 'ok web status=%s time_total_s=%s\n' "${status}" "${t_ms}" | tee -a "${LOG}"
    return 0
  fi
  printf 'FAIL web status=%s time_total_s=%s\n' "${status}" "${t_ms}" | tee -a "${LOG}"
  return 1
}

probe_graphql() {
  local tmp_body status t_ms
  tmp_body="$(mktemp)"
  local curl_args=(
    -sS
    --max-time "${CANARY_REQUEST_TIMEOUT_SEC}"
    -o "${tmp_body}"
    -w '%{http_code}|%{time_total}'
    -X POST
    -H 'Content-Type: application/json'
  )
  if [[ -n "${CANARY_AUTH_HEADER:-}" ]]; then
    curl_args+=(-H "${CANARY_AUTH_HEADER}")
  fi
  curl_args+=(--data "${CANARY_GRAPHQL_BODY}" "${STAGING_API_URL}")
  local meta
  meta="$(curl "${curl_args[@]}" 2>>"${LOG}" || true)"
  IFS='|' read -r status t_ms <<<"${meta}"
  status="${status:-000}"
  t_ms="${t_ms:-0}"
  local body_ok=false
  if [[ "${status}" == "200" ]] && graphql_ok "${tmp_body}"; then
    body_ok=true
  fi
  rm -f "${tmp_body}"
  if [[ "${body_ok}" == true ]]; then
    awk -v t="${t_ms}" 'BEGIN { printf "%.0f\n", t * 1000 }' >>"${API_TIMES_FILE}"
    printf 'ok graphql status=%s time_total_s=%s\n' "${status}" "${t_ms}" | tee -a "${LOG}"
    return 0
  fi
  printf 'FAIL graphql status=%s time_total_s=%s\n' "${status}" "${t_ms}" | tee -a "${LOG}"
  return 1
}

web_failures=0
api_failures=0
round=0

printf '=== canary start ===\n' | tee -a "${LOG}"
printf 'duration_sec=%s interval_sec=%s once=%s\n' "${CANARY_DURATION_SEC}" "${CANARY_INTERVAL_SEC}" "${CANARY_ONCE}" | tee -a "${LOG}"
printf 'web=%s graphql=%s\n' "${STAGING_BASE_URL}" "${STAGING_API_URL}" | tee -a "${LOG}"

if [[ "${CANARY_ONCE}" == "true" ]]; then
  round=1
  printf '\n--- round %s (CANARY_ONCE) ---\n' "${round}" | tee -a "${LOG}"
  if ! probe_web; then
    web_failures=$((web_failures + 1))
  fi
  if ! probe_graphql; then
    api_failures=$((api_failures + 1))
  fi
else
  deadline=$((SECONDS + CANARY_DURATION_SEC))
  while ((SECONDS < deadline)); do
    round=$((round + 1))
    printf '\n--- round %s ---\n' "${round}" | tee -a "${LOG}"

    if ! probe_web; then
      web_failures=$((web_failures + 1))
    fi
    if ! probe_graphql; then
      api_failures=$((api_failures + 1))
    fi

    if ((web_failures > CANARY_WEB_MAX_FAILURES)); then
      printf '\nRESULT=fail reason=web_failures_exceeded count=%s max=%s\n' "${web_failures}" "${CANARY_WEB_MAX_FAILURES}" | tee -a "${LOG}" "${SUMMARY}"
      exit 1
    fi
    if ((api_failures > CANARY_GRAPHQL_MAX_FAILURES)); then
      printf '\nRESULT=fail reason=graphql_failures_exceeded count=%s max=%s\n' "${api_failures}" "${CANARY_GRAPHQL_MAX_FAILURES}" | tee -a "${LOG}" "${SUMMARY}"
      exit 1
    fi

    if ((SECONDS >= deadline)); then
      break
    fi
    sleep "${CANARY_INTERVAL_SEC}"
  done
fi

if ((web_failures > CANARY_WEB_MAX_FAILURES)); then
  printf '\nRESULT=fail reason=web_failures_exceeded count=%s max=%s\n' "${web_failures}" "${CANARY_WEB_MAX_FAILURES}" | tee -a "${LOG}" "${SUMMARY}"
  exit 1
fi
if ((api_failures > CANARY_GRAPHQL_MAX_FAILURES)); then
  printf '\nRESULT=fail reason=graphql_failures_exceeded count=%s max=%s\n' "${api_failures}" "${CANARY_GRAPHQL_MAX_FAILURES}" | tee -a "${LOG}" "${SUMMARY}"
  exit 1
fi

web_ok_count="$(wc -l <"${WEB_TIMES_FILE}" | tr -d ' ')"
api_ok_count="$(wc -l <"${API_TIMES_FILE}" | tr -d ' ')"
if [[ "${web_ok_count}" -eq 0 ]]; then
  printf '\nRESULT=fail reason=no_successful_web_probes\n' | tee -a "${LOG}" "${SUMMARY}"
  exit 1
fi
if [[ "${api_ok_count}" -eq 0 ]]; then
  printf '\nRESULT=fail reason=no_successful_graphql_probes\n' | tee -a "${LOG}" "${SUMMARY}"
  exit 1
fi

p95_web="$(percentile95_ms "${WEB_TIMES_FILE}")"
p95_api="$(percentile95_ms "${API_TIMES_FILE}")"

printf '\n=== canary totals ===\n' | tee -a "${LOG}"
printf 'rounds=%s web_failures=%s graphql_failures=%s\n' "${round}" "${web_failures}" "${api_failures}" | tee -a "${LOG}"
printf 'p95_latency_ms_web=%s (threshold %s)\n' "${p95_web}" "${CANARY_P95_LATENCY_MS_WEB}" | tee -a "${LOG}"
printf 'p95_latency_ms_graphql=%s (threshold %s)\n' "${p95_api}" "${CANARY_P95_LATENCY_MS_API}" | tee -a "${LOG}"

fail=0
if [[ "${p95_web}" -gt "${CANARY_P95_LATENCY_MS_WEB}" ]]; then
  printf 'RESULT=fail reason=web_p95_latency\n' | tee -a "${LOG}" "${SUMMARY}"
  fail=1
fi
if [[ "${p95_api}" -gt "${CANARY_P95_LATENCY_MS_API}" ]]; then
  printf 'RESULT=fail reason=graphql_p95_latency\n' | tee -a "${LOG}" "${SUMMARY}"
  fail=1
fi

if [[ "${fail}" -eq 0 ]]; then
  {
    printf 'RESULT=pass\n'
    printf 'rounds=%s web_failures=%s graphql_failures=%s\n' "${round}" "${web_failures}" "${api_failures}"
    printf 'p95_latency_ms_web=%s p95_latency_ms_graphql=%s\n' "${p95_web}" "${p95_api}"
  } | tee -a "${LOG}" "${SUMMARY}"
  exit 0
fi

exit 1
