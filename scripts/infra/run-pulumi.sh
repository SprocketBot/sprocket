#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

usage() {
    cat <<'EOF'
Usage: scripts/infra/run-pulumi.sh <project> <stack> <preview|up|refresh> [extra pulumi args...]

Examples:
  scripts/infra/run-pulumi.sh platform prod preview
  scripts/infra/run-pulumi.sh layer_1 layer_1 up --yes

Environment:
  PULUMI_BACKEND_URL           Optional. If set, the script runs `pulumi login`.
  DOCKER_HOST                  Required unless PULUMI_REMOTE_DOCKER_* is set.
  PULUMI_REMOTE_DOCKER_USER    Optional fallback for deriving DOCKER_HOST.
  PULUMI_REMOTE_DOCKER_HOST    Optional fallback for deriving DOCKER_HOST.
  PULUMI_SKIP_PREVIEW=1        Skip the mandatory preview that runs before `up`.
EOF
}

[ "${1:-}" = "--help" ] && {
    usage
    exit 0
}

[ "$#" -lt 3 ] && {
    usage
    exit 1
}

PROJECT="$1"
STACK="$2"
COMMAND="$3"
shift 3

require_command pulumi

ensure_backend_login
ensure_remote_docker_host
ensure_stack_selected "$PROJECT" "$STACK"

PROJECT_DIR="$(project_dir "$PROJECT")"

run_pulumi() {
    local verb="$1"
    shift

    (
        cd "$PROJECT_DIR"
        pulumi "$verb" --stack "$STACK" "$@"
    )
}

case "$COMMAND" in
    preview)
        run_pulumi preview "$@"
        ;;
    up)
        if [ "${PULUMI_SKIP_PREVIEW:-0}" != "1" ]; then
            echo "Running required preview before apply."
            run_pulumi preview "$@"
        fi

        run_pulumi up "$@"
        ;;
    refresh)
        run_pulumi refresh "$@"
        ;;
    *)
        usage_error "Unsupported pulumi command '${COMMAND}'. Expected preview, up, or refresh"
        ;;
esac
