#!/usr/bin/env bash
# Resolve immutable image tag for staging promotion and optionally set platform Pulumi config.
# See infra/ci/README.md and .github/workflows/cd-promote-dev-to-staging.yml.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  promote-images.sh resolve-tag [--bom-file PATH] [--image-tag TAG] <full_git_sha>
      Print the image tag to stdout (also writes to GITHUB_OUTPUT as image_tag=... when set).

  promote-images.sh pulumi-set-platform-tag [--bom-file PATH] [--image-tag TAG] <full_git_sha> <pulumi_stack>
      Run: pulumi config set image-tag <tag> --stack <pulumi_stack>
      in infra/platform (requires PULUMI_* env as for normal Pulumi operations).

Options:
  --bom-file PATH   JSON BOM: root "imageTag"/"tag", or "images" map of service -> tag (all must match).
  --image-tag TAG   Skip BOM and SHA derivation; use this tag verbatim.

Environment:
  GITHUB_OUTPUT     When set, resolve-tag also appends image_tag=<value>.
EOF
}

usage_error() {
  echo "promote-images.sh: $*" >&2
  usage >&2
  exit 1
}

validate_full_sha() {
  local sha
  sha="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
    usage_error "git SHA must be exactly 40 hex characters (got '${1}')"
  fi
  printf '%s\n' "$sha"
}

resolve_from_bom() {
  local bom="$1"
  [[ -f "$bom" ]] || usage_error "BOM file not found: ${bom}"
  command -v jq >/dev/null 2>&1 || usage_error "jq is required to read --bom-file"

  local direct
  direct="$(jq -r '.imageTag // .tag // empty' "$bom" 2>/dev/null || true)"
  if [[ -n "$direct" && "$direct" != "null" ]]; then
    printf '%s\n' "$direct"
    return 0
  fi

  local tags_json
  if ! jq -e '.images | type == "object"' "$bom" >/dev/null 2>&1; then
    usage_error "BOM must contain imageTag, tag, or an images object"
  fi
  tags_json="$(jq -r '.images | to_entries[] | .value | if type == "string" then . else .tag end' "$bom")"
  if [[ -z "$tags_json" ]]; then
    usage_error "BOM images object produced no tags"
  fi

  local unique
  unique="$(printf '%s\n' "$tags_json" | sort -u)"
  local n
  n="$(printf '%s\n' "$unique" | grep -c . || true)"
  if [[ "$n" -ne 1 ]]; then
    usage_error "BOM images must resolve to a single tag (found mixed tags)"
  fi
  printf '%s\n' "$unique"
}

resolve_tag() {
  local full_sha="$1"
  local bom_file="${2:-}"
  local override="${3:-}"

  if [[ -n "$override" ]]; then
    printf '%s\n' "$override"
    return 0
  fi

  if [[ -n "$bom_file" ]]; then
    resolve_from_bom "$bom_file"
    return 0
  fi

  local short
  short="$(printf '%s\n' "$full_sha" | cut -c1-7)"
  printf 'sha-%s\n' "$short"
}

write_github_output() {
  local tag="$1"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    {
      printf 'image_tag=%s\n' "$tag"
    } >>"$GITHUB_OUTPUT"
  fi
}

pulumi_set_platform_tag() {
  local full_sha="$1"
  local stack="$2"
  local bom_file="${3:-}"
  local override="${4:-}"

  command -v pulumi >/dev/null 2>&1 || usage_error "pulumi CLI not found"

  local tag
  tag="$(resolve_tag "$full_sha" "$bom_file" "$override")"

  if [[ -n "${PULUMI_BACKEND_URL:-}" ]]; then
    pulumi login "${PULUMI_BACKEND_URL}"
  fi

  (
    cd "${REPO_ROOT}/infra/platform"
    pulumi stack select "$stack"
    pulumi config set image-tag "$tag" --stack "$stack"
  )
}

# --- main ---
[[ "${1:-}" =~ ^(-h|--help)$ ]] && {
  usage
  exit 0
}

cmd="${1:-}"
shift || true

bom_file=""
override_tag=""
while [[ "${1:-}" == --* ]]; do
  case "$1" in
    --bom-file)
      bom_file="${2:-}"
      [[ -n "$bom_file" ]] || usage_error "--bom-file requires a path"
      shift 2
      ;;
    --image-tag)
      override_tag="${2:-}"
      [[ -n "$override_tag" ]] || usage_error "--image-tag requires a value"
      shift 2
      ;;
    *)
      usage_error "unknown option: $1"
      ;;
  esac
done

case "$cmd" in
  resolve-tag)
    [[ "$#" -eq 1 ]] || usage_error "resolve-tag: expected exactly one git SHA argument"
    full_sha="$(validate_full_sha "$1")"
    tag="$(resolve_tag "$full_sha" "$bom_file" "$override_tag")"
    printf '%s\n' "$tag"
    write_github_output "$tag"
    ;;
  pulumi-set-platform-tag)
    [[ "$#" -eq 2 ]] || usage_error "pulumi-set-platform-tag: expected <full_git_sha> <pulumi_stack>"
    full_sha="$(validate_full_sha "$1")"
    pulumi_set_platform_tag "$full_sha" "$2" "$bom_file" "$override_tag"
    ;;
  *)
    usage_error "first argument must be resolve-tag or pulumi-set-platform-tag"
    ;;
esac
