#!/usr/bin/env bash
# Install Pulumi program dependencies (Node packages + plugins) for each infra stack project.
# Does not run in infra/global (no Pulumi.yaml); global is pulled via file: deps from each project.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

usage() {
    cat <<'EOF'
Usage: scripts/infra/pulumi-install-all.sh [--with-foundation] [--project <layer_1|layer_2|platform|foundation>]

Runs `pulumi install` in the requested infra stack projects.
If no --project flags are provided, defaults to infra/layer_1, infra/layer_2, and infra/platform.
With --with-foundation, also runs in infra/foundation (local dev parity with npm run infra:install).
EOF
}

WITH_FOUNDATION=0
PROJECTS=()
while [ "$#" -gt 0 ]; do
    case "$1" in
        --with-foundation)
            WITH_FOUNDATION=1
            ;;
        --project)
            if [ "$#" -lt 2 ]; then
                echo "Missing value for --project" >&2
                usage >&2
                exit 1
            fi
            PROJECTS+=("$2")
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
    esac
    shift
done

if [ "${#PROJECTS[@]}" -eq 0 ]; then
    PROJECTS=(layer_1 layer_2 platform)
fi

INSTALL_FOUNDATION=0
NORMALIZED_PROJECTS=()
for project in "${PROJECTS[@]}"; do
    case "${project}" in
        foundation)
            INSTALL_FOUNDATION=1
            ;;
        layer_1|layer_2|platform)
            skip_project=0
            for existing in "${NORMALIZED_PROJECTS[@]}"; do
                if [ "${existing}" = "${project}" ]; then
                    skip_project=1
                    break
                fi
            done
            if [ "${skip_project}" -eq 0 ]; then
                NORMALIZED_PROJECTS+=("${project}")
            fi
            ;;
        *)
            echo "Unsupported --project value: ${project}" >&2
            usage >&2
            exit 1
            ;;
    esac
done

for project in "${NORMALIZED_PROJECTS[@]}"; do
    rel="infra/${project}"
    echo "pulumi install in ${rel}"
    (cd "${REPO_ROOT}/${rel}" && pulumi install)
done

if [ "${WITH_FOUNDATION}" -eq 1 ] || [ "${INSTALL_FOUNDATION}" -eq 1 ]; then
    echo "pulumi install in infra/foundation"
    (cd "${REPO_ROOT}/infra/foundation" && pulumi install)
fi
