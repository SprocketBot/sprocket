#!/usr/bin/env bash

set -euo pipefail

sprocket_repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

sprocket_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    printf "docker compose"
    return 0
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    printf "docker-compose"
    return 0
  fi

  printf "Neither 'docker compose' nor 'docker-compose' is available.\n" >&2
  exit 1
}

sprocket_require_local_env() {
  local repo_root="$1"

  if [[ -f "${repo_root}/.env" ]]; then
    return 0
  fi

  if [[ -f "${repo_root}/.env.local" ]]; then
    cp "${repo_root}/.env.local" "${repo_root}/.env"
    printf "Created .env from .env.local for local runtime.\n"
    return 0
  fi

  printf "Missing both .env and .env.local in %s\n" "${repo_root}" >&2
  exit 1
}

sprocket_compose() {
  local repo_root="$1"
  shift

  local compose_cmd
  compose_cmd="$(sprocket_compose_cmd)"

  (
    cd "${repo_root}"
    ${compose_cmd} "$@"
  )
}
