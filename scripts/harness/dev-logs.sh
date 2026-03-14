#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/dev-common.sh"

REPO_ROOT="$(sprocket_repo_root)"
TAIL_LINES="${SPROCKET_LOG_TAIL:-100}"

printf "Showing local Sprocket logs from %s (tail=%s)\n" "${REPO_ROOT}" "${TAIL_LINES}"
sprocket_compose "${REPO_ROOT}" logs --tail="${TAIL_LINES}" -f "$@"
