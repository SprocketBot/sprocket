#!/usr/bin/env bash
# Set platform:image-tag on the dev Pulumi stack to an immutable sha-* tag.
# Prefer the merged BOM from Autobuild (issue #671); fall back to sha-<git-sha> (#670).
#
# Usage: pulumi-set-dev-image-tag.sh <git-sha> [path-to-bom.json]
#
# Requires: pulumi, jq; run from repo root after `pulumi login` and stack init/select for infra/platform.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMMIT="${1:?usage: pulumi-set-dev-image-tag.sh <git-sha> [bom.json]}"
BOM_FILE="${2:-}"
STACK_NAME="${PULUMI_DEV_PLATFORM_STACK:-dev}"

cd "${REPO_ROOT}/infra/platform"

pulumi stack select "${STACK_NAME}"

TAG="sha-${COMMIT}"
if [[ -n "${BOM_FILE}" && -f "${BOM_FILE}" ]]; then
  GOT="$(jq -r '.commit' "${BOM_FILE}")"
  if [[ "${GOT}" != "${COMMIT}" ]]; then
    echo "pulumi-set-dev-image-tag: BOM commit ${GOT} does not match expected ${COMMIT}" >&2
    exit 1
  fi
  BOM_TAG="$(
    jq -r '[.images[]?.tags[]? | select(type == "string" and startswith("sha-"))] | first // empty' \
      "${BOM_FILE}"
  )"
  if [[ -n "${BOM_TAG}" && "${BOM_TAG}" != "null" ]]; then
    TAG="${BOM_TAG}"
  fi
fi

pulumi config set platform:image-tag "${TAG}"
echo "pulumi-set-dev-image-tag: set platform:image-tag=${TAG} on stack ${STACK_NAME}"
