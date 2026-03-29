#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$#" -lt 2 ]; then
    echo "Usage: scripts/infra/preview.sh <project> <stack> [extra pulumi args...]" >&2
    exit 1
fi

exec "${SCRIPT_DIR}/run-pulumi.sh" "$1" "$2" preview "${@:3}"
