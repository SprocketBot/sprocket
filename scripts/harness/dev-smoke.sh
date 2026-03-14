#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_PATH="${1:-env/local.env}"

exec bash "${SCRIPT_DIR}/run-tier0.sh" "${PROFILE_PATH}"
