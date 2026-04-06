#!/usr/bin/env bash
# List and drive agent-created issue worktrees (companion to spawn-issue-agents.sh).
#
# Run from any worktree of the repo (e.g. main/). Uses the same default root as
# spawn-issue-agents: <parent-of-git-toplevel>/.agent-issue-worktrees
#
# Usage:
#   scripts/agent/agent-issue-worktrees.sh list [--worktree-root DIR]
#   scripts/agent/agent-issue-worktrees.sh open ISSUE [--worktree-root DIR]
#   scripts/agent/agent-issue-worktrees.sh pr ISSUE [--draft] [--worktree-root DIR]
#   scripts/agent/agent-issue-worktrees.sh shell ISSUE   # prints cd command
#   scripts/agent/agent-issue-worktrees.sh check ISSUE   # git status + short log + diff stat vs base
#
set -euo pipefail

DEFAULT_REPO="${GITHUB_REPO:-SprocketBot/sprocket}"
REPO="$DEFAULT_REPO"
WORKTREE_ROOT_OVERRIDE=""
DRAFT=0
CMD=""

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  cat <<'EOF'

Commands:
  list              Show each issue-* worktree: branch, dirty state, commits ahead, PR link
  open ISSUE        Open worktree in a new Cursor window (cursor -n)
  pr ISSUE          From that worktree: push (if needed) and gh pr create
  shell ISSUE       Print a cd command for the worktree
  check ISSUE       git status, recent commits, diff --stat vs merge-base with base branch

Options:
  -R, --repo OWNER/REPO   For gh pr commands (default: SprocketBot/sprocket or GITHUB_REPO)
      --worktree-root DIR Override worktree parent directory
      --draft               With pr: pass --draft to gh pr create
  -h, --help

Environment:
  GITHUB_REPO         Default for -R (same as gh's default when run inside repo)
EOF
}

log() { printf '%s\n' "$*" >&2; }
die() { log "error: $*"; exit 1; }

resolve_default_worktree_root() {
  if [[ -n "$WORKTREE_ROOT_OVERRIDE" ]]; then
    cd "$WORKTREE_ROOT_OVERRIDE" && pwd
    return
  fi
  if [[ -n "${AGENT_WORKTREE_ROOT:-}" ]]; then
    cd "$AGENT_WORKTREE_ROOT" && pwd
    return
  fi
  if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
    die "run from inside a git worktree, or set AGENT_WORKTREE_ROOT / --worktree-root"
  fi
  local top reporoot
  top="$(git rev-parse --show-toplevel)"
  top="$(cd "$top" && pwd)"
  reporoot="$(cd "$top/.." && pwd)"
  printf '%s' "${reporoot}/.agent-issue-worktrees"
}

require_gh() {
  command -v gh >/dev/null 2>&1 || die "gh not found"
  gh auth status >/dev/null 2>&1 || die "gh not authenticated"
}

path_for_issue() {
  local n="$1"
  [[ $n =~ ^[0-9]+$ ]] || die "invalid issue number: $n"
  local root wt
  root="$(resolve_default_worktree_root)"
  wt="${root}/issue-${n}"
  [[ -e "$wt" ]] || die "no worktree at $wt"
  printf '%s' "$wt"
}

# --- argument parsing: first non-flag word is command
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -R|--repo) REPO="$2"; shift 2 ;;
    --worktree-root) WORKTREE_ROOT_OVERRIDE="$2"; shift 2 ;;
    --draft) DRAFT=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) ARGS+=("$1"); shift ;;
  esac
done

[[ ${#ARGS[@]} -ge 1 ]] || { usage; exit 1; }
CMD="${ARGS[0]}"
ISSUE_NUM="${ARGS[1]:-}"

case "$CMD" in
  list)
    [[ ${#ARGS[@]} -eq 1 ]] || die "list takes no extra arguments"
    root="$(resolve_default_worktree_root)"
    [[ -d "$root" ]] || die "worktree root missing: $root"
    require_gh
    printf '%-8s %-36s %-8s %-6s %-40s\n' "ISSUE" "BRANCH" "DIRTY" "AHEAD" "PR"
    printf '%-8s %-36s %-8s %-6s %-40s\n' "------" "------------------------------------" "------" "------" "----------------------------------------"
    shopt -s nullglob
    for d in "$root"/issue-*; do
      [[ -d "$d" ]] || continue
      base="${d##*/}"
      num="${base#issue-}"
      [[ $num =~ ^[0-9]+$ ]] || continue
      br="$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")"
      dirty="$(git -C "$d" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
      ahead="$(git -C "$d" rev-list --count '@{u}..HEAD' 2>/dev/null || echo "?")"
      if [[ "$ahead" == "?" ]]; then
        ahead="$(git -C "$d" rev-list --count origin/main..HEAD 2>/dev/null || echo "?")"
      fi
      pr_url="$(gh pr list --repo "$REPO" --head "$br" --json url --jq '.[0].url // "-"' 2>/dev/null || echo "?")"
      printf '%-8s %-36s %-8s %-6s %-40s\n' "$num" "$br" "$dirty" "$ahead" "$pr_url"
    done
    shopt -u nullglob
    manifest="${root}/run-latest.json"
    if [[ -f "$manifest" ]]; then
      log ""
      log "Latest spawn manifest: $manifest"
    fi
    ;;
  open)
    [[ -n "$ISSUE_NUM" ]] || die "usage: ... open ISSUE"
    [[ ${#ARGS[@]} -eq 2 ]] || die "usage: ... open ISSUE"
    wt="$(path_for_issue "$ISSUE_NUM")"
    command -v cursor >/dev/null 2>&1 || die "cursor CLI not found"
    log "opening $wt in Cursor"
    exec cursor -n "$wt"
    ;;
  pr)
    [[ -n "$ISSUE_NUM" ]] || die "usage: ... pr ISSUE"
    [[ ${#ARGS[@]} -eq 2 ]] || die "usage: ... pr ISSUE"
    require_gh
    wt="$(path_for_issue "$ISSUE_NUM")"
    br="$(git -C "$wt" rev-parse --abbrev-ref HEAD)"
    existing="$(gh pr list --repo "$REPO" --head "$br" --json url --jq '.[0].url // empty')"
    if [[ -n "$existing" ]]; then
      log "PR already exists: $existing"
      exit 0
    fi
    if [[ -n "$(git -C "$wt" status --porcelain)" ]]; then
      die "worktree has uncommitted changes; commit or stash first"
    fi
    root="$(resolve_default_worktree_root)"
    base_branch=""
    if [[ -f "${root}/run-latest.json" ]]; then
      base_branch="$(jq -r '.base_branch // empty' "${root}/run-latest.json" 2>/dev/null || true)"
    fi
    if [[ -z "$base_branch" ]]; then
      base_branch="$(gh api "repos/${REPO}" --jq .default_branch 2>/dev/null || echo main)"
    fi
    log "pushing $br to origin (if needed)..."
    git -C "$wt" push -u origin "$br" 2>&1 || die "git push failed"
    pr_args=(gh pr create --repo "$REPO" --base "$base_branch" --head "$br" --title "Fix: issue #${ISSUE_NUM}" --body "Fixes #${ISSUE_NUM}")
    if [[ "$DRAFT" -eq 1 ]]; then
      pr_args+=(--draft)
    fi
    log "creating PR..."
    "${pr_args[@]}"
    ;;
  shell)
    [[ -n "$ISSUE_NUM" ]] || die "usage: ... shell ISSUE"
    [[ ${#ARGS[@]} -eq 2 ]] || die "usage: ... shell ISSUE"
    wt="$(path_for_issue "$ISSUE_NUM")"
    printf 'cd %q\n' "$wt"
    ;;
  check)
    [[ -n "$ISSUE_NUM" ]] || die "usage: ... check ISSUE"
    [[ ${#ARGS[@]} -eq 2 ]] || die "usage: ... check ISSUE"
    wt="$(path_for_issue "$ISSUE_NUM")"
    root="$(resolve_default_worktree_root)"
    base_branch=""
    if [[ -f "${root}/run-latest.json" ]] && command -v jq >/dev/null 2>&1; then
      base_branch="$(jq -r '.base_branch // empty' "${root}/run-latest.json" 2>/dev/null || true)"
    fi
    if [[ -z "$base_branch" ]]; then
      require_gh
      base_branch="$(gh api "repos/${REPO}" --jq .default_branch 2>/dev/null || echo main)"
    fi
    log "=== git status ($wt) ==="
    git -C "$wt" status -sb
    log ""
    log "=== recent commits ==="
    git -C "$wt" log --oneline -8
    log ""
    log "=== diff vs origin/${base_branch} (merge-base) ==="
    mb="$(git -C "$wt" merge-base "HEAD" "origin/${base_branch}" 2>/dev/null || git -C "$wt" merge-base "HEAD" "${base_branch}" 2>/dev/null || true)"
    if [[ -n "$mb" ]]; then
      git -C "$wt" diff --stat "$mb"..HEAD
    else
      log "(could not compute merge-base; fetch remotes or check branch names)"
    fi
    ;;
  *)
    die "unknown command: $CMD (use --help)"
    ;;
esac
