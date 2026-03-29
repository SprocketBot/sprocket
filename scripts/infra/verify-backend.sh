#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "${SCRIPT_DIR}/common.sh"

usage() {
    cat <<'EOF'
Usage: scripts/infra/verify-backend.sh <project> <stack>

Exports the selected stack, writes a backup under infra/backups/, and prints a
small metadata summary to help confirm backend and secrets configuration.
EOF
}

[ "${1:-}" = "--help" ] && {
    usage
    exit 0
}

[ "$#" -ne 2 ] && {
    usage
    exit 1
}

PROJECT="$1"
STACK="$2"

require_command pulumi
require_command jq

ensure_backend_login
ensure_stack_selected "$PROJECT" "$STACK"

PROJECT_DIR="$(project_dir "$PROJECT")"
STACK_CONFIG="$(stack_config_path "$PROJECT" "$STACK")"
BACKUP_DIR="${REPO_ROOT}/infra/backups"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
EXPORT_PATH="${BACKUP_DIR}/${PROJECT}-${STACK}-${TIMESTAMP}.json"
REPORT_PATH="${BACKUP_DIR}/${PROJECT}-${STACK}-${TIMESTAMP}.report.txt"

mkdir -p "$BACKUP_DIR"

(
    cd "$PROJECT_DIR"
    pulumi stack export --stack "$STACK" >"$EXPORT_PATH"
)

{
    echo "project=${PROJECT}"
    echo "stack=${STACK}"
    echo "project_dir=${PROJECT_DIR}"
    echo "stack_config_path=${STACK_CONFIG}"
    echo "state_export=${EXPORT_PATH}"
    echo "backend_identity=$(pulumi whoami -v 2>&1 | tr '\n' ' ' | sed 's/[[:space:]]\\+/ /g')"
    echo "secrets_provider_type=$(jq -r '.deployment.secrets_providers.type // \"unknown\"' "$EXPORT_PATH")"
    echo "secrets_provider_state=$(jq -c '.deployment.secrets_providers.state // {}' "$EXPORT_PATH")"

    if [ -f "$STACK_CONFIG" ]; then
        echo "local_stack_config_present=true"
        if grep -q '^encryptionsalt:' "$STACK_CONFIG"; then
            echo "local_encryptionsalt_present=true"
        else
            echo "local_encryptionsalt_present=false"
        fi
    else
        echo "local_stack_config_present=false"
    fi
} | tee "$REPORT_PATH"

echo "Wrote stack export to ${EXPORT_PATH}"
echo "Wrote metadata report to ${REPORT_PATH}"
