#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_ROOT="${REPO_ROOT}/environments"

usage() {
  cat >&2 <<'EOF'
Usage:
  verify-lane.sh tier0 <lane> [profile.env]
  verify-lane.sh tier1 <lane> [profile.env] [league|scrim|submission|all]
  verify-lane.sh all <lane> [profile.env]

Examples:
  bash ./scripts/harness/verify-lane.sh tier0 local-dev
  bash ./scripts/harness/verify-lane.sh tier0 main-prod
  bash ./scripts/harness/verify-lane.sh tier1 main-prod /absolute/path/to/tier1.env league
  bash ./scripts/harness/verify-lane.sh all main-prod /absolute/path/to/tier1.env
EOF
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

MODE="$1"
LANE="$2"
shift 2

CONTRACT_PATH="${ENV_ROOT}/${LANE}.json"
if [[ ! -f "${CONTRACT_PATH}" ]]; then
  printf "Unknown lane '%s'. Expected contract at %s\n" "${LANE}" "${CONTRACT_PATH}" >&2
  exit 1
fi

read_contract_field() {
  local field_path="$1"
  python3 - "$CONTRACT_PATH" "$field_path" <<'PY'
import json, sys
from pathlib import Path
contract_path = Path(sys.argv[1])
field_path = sys.argv[2].split('.')
data = json.loads(contract_path.read_text())
cur = data
for part in field_path:
    if isinstance(cur, dict) and part in cur:
        cur = cur[part]
    else:
        print("")
        raise SystemExit(0)
if cur is None:
    print("")
elif isinstance(cur, bool):
    print("true" if cur else "false")
elif isinstance(cur, (list, dict)):
    print(json.dumps(cur))
else:
    print(cur)
PY
}

contract_name="$(read_contract_field name)"
if [[ -z "${contract_name}" ]]; then
  printf "Lane contract at %s is missing required field 'name'\n" "${CONTRACT_PATH}" >&2
  exit 1
fi

resolve_profile() {
  local mode_key="$1"
  local override_path="${2:-}"
  local default_profile template_profile

  if [[ -n "${override_path}" ]]; then
    if [[ "${override_path}" != /* ]]; then
      override_path="${REPO_ROOT}/${override_path}"
    fi
    printf "%s" "${override_path}"
    return 0
  fi

  default_profile="$(read_contract_field verification.${mode_key}.default_profile)"
  if [[ -n "${default_profile}" ]]; then
    printf "%s" "${REPO_ROOT}/${default_profile}"
    return 0
  fi

  template_profile="$(read_contract_field verification.${mode_key}.profile_template)"
  if [[ -n "${template_profile}" ]]; then
    printf ""
    return 0
  fi

  printf ""
}

ensure_supported() {
  local mode_key="$1"
  local supported reason
  supported="$(read_contract_field verification.${mode_key}.supported)"
  reason="$(read_contract_field verification.${mode_key}.reason)"
  if [[ "${supported}" != "true" ]]; then
    printf "Lane '%s' does not currently support %s. %s\n" "${LANE}" "${mode_key}" "${reason}" >&2
    exit 1
  fi
}

run_tier0() {
  local profile_override="${1:-}"
  local profile_path
  ensure_supported tier0
  profile_path="$(resolve_profile tier0 "${profile_override}")"
  if [[ -z "${profile_path}" ]]; then
    printf "Lane '%s' requires an explicit Tier 0 profile override.\n" "${LANE}" >&2
    exit 1
  fi
  if [[ ! -f "${profile_path}" ]]; then
    printf "Tier 0 profile not found for lane '%s': %s\n" "${LANE}" "${profile_path}" >&2
    exit 1
  fi
  printf "Running Tier 0 for lane '%s' using %s\n" "${LANE}" "${profile_path}"
  bash "${SCRIPT_DIR}/run-tier0.sh" "${profile_path}"
}

run_tier1() {
  local profile_override="${1:-}"
  local scenario="${2:-all}"
  local profile_path template_path
  ensure_supported tier1
  profile_path="$(resolve_profile tier1 "${profile_override}")"
  template_path="$(read_contract_field verification.tier1.profile_template)"
  if [[ -z "${profile_path}" ]]; then
    printf "Lane '%s' requires an explicit Tier 1 profile override.\n" "${LANE}" >&2
    if [[ -n "${template_path}" ]]; then
      printf "Template hint: %s\n" "${REPO_ROOT}/${template_path}" >&2
    fi
    exit 1
  fi
  if [[ ! -f "${profile_path}" ]]; then
    printf "Tier 1 profile not found for lane '%s': %s\n" "${LANE}" "${profile_path}" >&2
    if [[ -n "${template_path}" ]]; then
      printf "Template hint: %s\n" "${REPO_ROOT}/${template_path}" >&2
    fi
    exit 1
  fi
  printf "Running Tier 1 scenario '%s' for lane '%s' using %s\n" "${scenario}" "${LANE}" "${profile_path}"
  bash "${SCRIPT_DIR}/run-tier1.sh" "${profile_path}" "${scenario}"
}

case "${MODE}" in
  tier0)
    run_tier0 "${1:-}"
    ;;
  tier1)
    run_tier1 "${1:-}" "${2:-all}"
    ;;
  all)
    ensure_supported all
    run_tier0 "${1:-}"
    run_tier1 "${1:-}" all
    ;;
  *)
    printf "Unknown mode '%s'\n" "${MODE}" >&2
    usage
    exit 1
    ;;
esac
