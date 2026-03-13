#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

STEP_NAME="${HARNESS_COLLECT_STEP:-collect-artifacts}"
STEP_DIR="$(harness_prepare_step_dir "${STEP_NAME}")"
RAW_DIR="${STEP_DIR}/raw"
ALLOW_MISSING="${HARNESS_ALLOW_MISSING:-false}"
SUMMARY_TEXT="${HARNESS_SUMMARY:-}"

mkdir -p "${RAW_DIR}"

declare -a PATHS=()

if [[ "$#" -gt 0 ]]; then
  PATHS=("$@")
elif [[ -n "${HARNESS_COLLECT_PATHS:-}" ]]; then
  while IFS= read -r ENTRY; do
    [[ -z "${ENTRY}" ]] && continue
    PATHS+=("${ENTRY}")
  done < <(printf '%s\n' "${HARNESS_COLLECT_PATHS}" | tr ',' '\n')
fi

if [[ "${#PATHS[@]}" -eq 0 ]]; then
  printf "No artifact paths supplied. Pass paths as arguments or set HARNESS_COLLECT_PATHS.\n" >&2
  exit 1
fi

COPIED=0
for SOURCE_PATH in "${PATHS[@]}"; do
  if [[ ! -e "${SOURCE_PATH}" ]]; then
    if [[ "${ALLOW_MISSING}" == "true" ]]; then
      continue
    fi

    printf "Artifact path does not exist: %s\n" "${SOURCE_PATH}" >&2
    exit 1
  fi

  cp -R "${SOURCE_PATH}" "${RAW_DIR}/"
  COPIED=$((COPIED + 1))
done

harness_write_summary "${STEP_DIR}/summary.txt" \
  "status=pass" \
  "copied_paths=${COPIED}" \
  "summary=${SUMMARY_TEXT:-none}"

printf "collect-artifacts copied %s path(s) into %s\n" "${COPIED}" "${RAW_DIR}"
