#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/dev-common.sh"

REPO_ROOT="$(sprocket_repo_root)"
sprocket_require_local_env "${REPO_ROOT}"

if [[ "${SPROCKET_DEV_RESET_CONFIRM:-}" != "YES" ]]; then
  printf "Refusing destructive reset. Re-run with SPROCKET_DEV_RESET_CONFIRM=YES to drop local containers and volumes.\n" >&2
  exit 1
fi

printf "Resetting local Sprocket stack from %s\n" "${REPO_ROOT}"
sprocket_compose "${REPO_ROOT}" down -v
sprocket_compose "${REPO_ROOT}" up -d
printf "Local stack reset complete.\n"
