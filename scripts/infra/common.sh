#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

readonly SCRIPT_DIR
readonly REPO_ROOT

usage_error() {
    echo "Error: $*" >&2
    exit 1
}

require_command() {
    local cmd="$1"

    command -v "$cmd" >/dev/null 2>&1 || usage_error "Required command not found: ${cmd}"
}

project_dir() {
    local project="$1"

    case "$project" in
        layer_1|layer_2|platform)
            printf "%s/infra/%s\n" "$REPO_ROOT" "$project"
            ;;
        *)
            usage_error "Unsupported stack project '${project}'. Expected one of: layer_1, layer_2, platform"
            ;;
    esac
}

stack_config_path() {
    local project="$1"
    local stack="$2"
    local dir

    dir="$(project_dir "$project")"
    printf "%s/Pulumi.%s.yaml\n" "$dir" "$stack"
}

ensure_backend_login() {
    if [ -n "${PULUMI_BACKEND_URL:-}" ]; then
        echo "Logging into Pulumi backend: ${PULUMI_BACKEND_URL}"
        pulumi login "${PULUMI_BACKEND_URL}"
    elif [ "${PULUMI_SKIP_LOGIN:-0}" != "1" ]; then
        echo "PULUMI_BACKEND_URL is not set; using the currently logged-in Pulumi backend."
    fi
}

ensure_remote_docker_host() {
    if [ -n "${DOCKER_HOST:-}" ]; then
        return
    fi

    if [ -n "${PULUMI_REMOTE_DOCKER_USER:-}" ] && [ -n "${PULUMI_REMOTE_DOCKER_HOST:-}" ]; then
        export DOCKER_HOST="ssh://${PULUMI_REMOTE_DOCKER_USER}@${PULUMI_REMOTE_DOCKER_HOST}"
        echo "Derived DOCKER_HOST=${DOCKER_HOST}"
        return
    fi

    usage_error "DOCKER_HOST is not set. Provide DOCKER_HOST or both PULUMI_REMOTE_DOCKER_USER and PULUMI_REMOTE_DOCKER_HOST."
}

ensure_stack_selected() {
    local project="$1"
    local stack="$2"

    (
        cd "$(project_dir "$project")"
        pulumi stack select "$stack"
    )
}
