#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/dev-common.sh"

REPO_ROOT="$(sprocket_repo_root)"

printf "Local Sprocket stack status for %s\n" "${REPO_ROOT}"
sprocket_compose "${REPO_ROOT}" ps
