#!/usr/bin/env bash

set -euo pipefail

harness_repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

harness_now_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

harness_run_id() {
  if [[ -z "${HARNESS_RUN_ID:-}" ]]; then
    HARNESS_RUN_ID="$(date -u +"%Y%m%dT%H%M%SZ")"
  fi

  printf "%s" "${HARNESS_RUN_ID}"
}

harness_env_name() {
  printf "%s" "${HARNESS_ENV_NAME:-adhoc}"
}

harness_artifact_root() {
  local root="${HARNESS_ARTIFACT_ROOT:-artifacts/release-validation}"

  if [[ "${root}" != /* ]]; then
    root="$(harness_repo_root)/${root}"
  fi

  printf "%s" "${root}"
}

harness_git_branch() {
  git rev-parse --abbrev-ref HEAD 2>/dev/null || printf "unknown"
}

harness_git_commit() {
  git rev-parse HEAD 2>/dev/null || printf "unknown"
}

harness_prepare_step_dir() {
  local step="$1"
  local base_dir
  local step_dir

  base_dir="$(harness_artifact_root)/$(harness_env_name)/$(harness_run_id)"
  step_dir="${base_dir}/${step}"

  mkdir -p "${step_dir}"
  harness_write_run_metadata "${base_dir}"

  printf "%s" "${step_dir}"
}

harness_write_run_metadata() {
  local base_dir="$1"
  local metadata_file="${base_dir}/run-metadata.env"

  if [[ -f "${metadata_file}" ]]; then
    return
  fi

  mkdir -p "${base_dir}"

  {
    printf "HARNESS_ENV_NAME=%s\n" "$(harness_env_name)"
    printf "HARNESS_RUN_ID=%s\n" "$(harness_run_id)"
    printf "HARNESS_TIMESTAMP=%s\n" "$(harness_now_utc)"
    printf "HARNESS_BRANCH=%s\n" "$(harness_git_branch)"
    printf "HARNESS_COMMIT=%s\n" "$(harness_git_commit)"
  } > "${metadata_file}"
}

harness_require_command() {
  local command_name="$1"

  if ! command -v "${command_name}" >/dev/null 2>&1; then
    printf "Missing required command: %s\n" "${command_name}" >&2
    exit 1
  fi
}

harness_require_env() {
  local env_name="$1"

  if [[ -z "${!env_name:-}" ]]; then
    printf "Missing required environment variable: %s\n" "${env_name}" >&2
    exit 1
  fi
}

harness_status_allowed() {
  local allowed_csv="$1"
  local actual_status="$2"
  local candidate

  IFS=',' read -r -a allowed_statuses <<< "${allowed_csv}"
  for candidate in "${allowed_statuses[@]}"; do
    if [[ "${candidate}" == "${actual_status}" ]]; then
      return 0
    fi
  done

  return 1
}

harness_write_summary() {
  local summary_file="$1"
  shift

  {
    printf "timestamp=%s\n" "$(harness_now_utc)"
    for line in "$@"; do
      printf "%s\n" "${line}"
    done
  } > "${summary_file}"
}
