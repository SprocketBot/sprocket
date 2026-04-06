#!/usr/bin/env bash
# Merge per-job BOM fragment.json files (from upload-artifact) into one manifest.
# Promotion / deploy workflows will consume artifacts/bom/main-<sha>.json (see on-changes.yml).

set -euo pipefail

INPUT_DIR="${1:?usage: merge-bom-artifacts.sh <input-dir> <output-json>}"
OUTPUT_JSON="${2:?usage: merge-bom-artifacts.sh <input-dir> <output-json>}"

COMMIT="${GITHUB_SHA:?GITHUB_SHA is required}"
REF="${GITHUB_REF:?GITHUB_REF is required}"
BUILT_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mapfile -t FRAGS < <(find "${INPUT_DIR}" -type f -name '*.json' 2>/dev/null | sort -u)

if [ "${#FRAGS[@]}" -eq 0 ]; then
  echo "merge-bom-artifacts: no *.json fragments under ${INPUT_DIR}" >&2
  exit 1
fi

IMAGES_JSON="$(jq -s '[.[]]' "${FRAGS[@]}")"

mkdir -p "$(dirname "${OUTPUT_JSON}")"

jq -n \
  --arg commit "${COMMIT}" \
  --arg ref "${REF}" \
  --arg built_at "${BUILT_AT}" \
  --argjson images "${IMAGES_JSON}" \
  '{commit: $commit, ref: $ref, built_at: $built_at, images: $images}' \
  > "${OUTPUT_JSON}"

echo "Wrote ${OUTPUT_JSON} (${#FRAGS[@]} image fragment(s))"
