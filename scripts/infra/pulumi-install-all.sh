#!/usr/bin/env bash
# Install Pulumi program dependencies (Node packages + plugins) for each infra stack project.
# Does not run in infra/global (no Pulumi.yaml); global is pulled via file: deps from each project.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

usage() {
    cat <<'EOF'
Usage: scripts/infra/pulumi-install-all.sh [--with-foundation]

Runs `pulumi install` in infra/layer_1, infra/layer_2, and infra/platform.
With --with-foundation, also runs in infra/foundation (local dev parity with npm run infra:install).
EOF
}

WITH_FOUNDATION=0
while [ "$#" -gt 0 ]; do
    case "$1" in
        --with-foundation)
            WITH_FOUNDATION=1
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

for rel in infra/layer_1 infra/layer_2 infra/platform; do
    echo "pulumi install in ${rel}"
    (cd "${REPO_ROOT}/${rel}" && pulumi install)
done

if [ "${WITH_FOUNDATION}" -eq 1 ]; then
    echo "pulumi install in infra/foundation"
    (cd "${REPO_ROOT}/infra/foundation" && pulumi install)
fi
