#!/usr/bin/env bash
# Spawn one Cursor Agent per GitHub issue, each in its own git worktree.
#
# Requirements: git, gh (authenticated), cursor-agent (~/.local/bin/cursor-agent or PATH).
#
# Typical usage (from any worktree of the repo, e.g. ./main):
#   ./scripts/agent/spawn-issue-agents.sh --count 3
#   ./scripts/agent/spawn-issue-agents.sh --issues 42,108
#   ./scripts/agent/spawn-issue-agents.sh --count 2 --label bug --parallel
#
# After a run, inspect worktrees and open PRs with:
#   ./scripts/agent/agent-issue-worktrees.sh list
#   ./scripts/agent/agent-issue-worktrees.sh check 42 && ./scripts/agent/agent-issue-worktrees.sh pr 42
#
set -euo pipefail

DEFAULT_REPO="SprocketBot/sprocket"
REPO="$DEFAULT_REPO"
COUNT=""
ISSUES_CSV=""
BASE_REF="origin/main"
WORKTREE_ROOT=""
BRANCH_PREFIX="agent/gh-issue"
SORT_ORDER="oldest"
DRY_RUN=0
DO_FETCH=1
PARALLEL=1
WAIT_ALL=0
LABELS=()
EXTRA_SEARCH=""
REUSE_EXISTING=0
LOG_DIR=""
PROMPT_TAIL=""
SKIP_PR_INSTRUCTIONS=0
CURSOR_AGENT_BIN="${CURSOR_AGENT_BIN:-}"
MODEL="${CURSOR_MODEL:-}"
AGENT_EXTRA_ARGS=()
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Set by run_agent when launching cursor-agent in parallel (do not use pid="$(run_agent ...)"
# — a command substitution subshell waits for its background jobs, which would block until
# the first agent exits).
AGENT_PID=""

usage() {
  sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
  cat <<'EOF'

Options:
  -R, --repo OWNER/REPO     GitHub repo (default: SprocketBot/sprocket)
  -c, --count N             Take the next N open issues (via gh issue list)
  -i, --issues N[,N...]     Explicit issue numbers (comma-separated)
      --base REF            Base ref for new branches (default: origin/main)
      --worktree-root DIR   Parent directory for per-issue worktrees
                            (default: <repo-root>/.agent-issue-worktrees)
      --branch-prefix PFX   Local branch prefix (default: agent/gh-issue)
      --sort oldest|newest   Issue ordering when using --count (default: oldest)
  -l, --label LABEL         Pass-through to gh issue list (repeatable)
  -S, --search QUERY        Extra gh search terms (e.g. 'no:assignee')
      --no-fetch            Skip 'git fetch origin' before creating worktrees
      --sequential          Run agents one after another (default: parallel)
      --wait                After starting parallel agents, wait for all to exit
      --reuse               If worktree path exists, only launch agent (no git worktree add)
      --log-dir DIR         Write agent stdout/stderr to DIR/<issue>.log
      --prompt-extra TEXT   Append to the agent prompt (one string)
      --dry-run             Print actions only
      --print-only          Same as passing --print to cursor-agent (default on)
      --model MODEL         Forward --model to cursor-agent
      --skip-pr-instructions Omit PR-creation block from the agent prompt
  -h, --help                Show this help

Environment:
  CURSOR_AGENT_BIN          Path to cursor-agent binary
  CURSOR_MODEL              Default model for --model
  CURSOR_API_KEY            Auth for cursor-agent (see cursor-agent login)

Examples:
  scripts/agent/spawn-issue-agents.sh --count 2 --sequential
  scripts/agent/spawn-issue-agents.sh --issues 55 --worktree-root "$PWD/../my-wt"
EOF
}

log() { printf '%s\n' "$*" >&2; }

die() { log "error: $*"; exit 1; }

resolve_cursor_agent() {
  if [[ -n "$CURSOR_AGENT_BIN" ]]; then
    [[ -x "$CURSOR_AGENT_BIN" ]] || die "CURSOR_AGENT_BIN is not executable: $CURSOR_AGENT_BIN"
    printf '%s' "$CURSOR_AGENT_BIN"
    return
  fi
  if command -v cursor-agent >/dev/null 2>&1; then
    command -v cursor-agent
    return
  fi
  if [[ -x "${HOME}/.local/bin/cursor-agent" ]]; then
    printf '%s' "${HOME}/.local/bin/cursor-agent"
    return
  fi
  die "cursor-agent not found. Install from Cursor or set CURSOR_AGENT_BIN."
}

require_gh() {
  command -v gh >/dev/null 2>&1 || die "gh CLI not found (https://cli.github.com/)"
  gh auth status >/dev/null 2>&1 || die "gh not authenticated; run: gh auth login"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -R|--repo) REPO="$2"; shift 2 ;;
    -c|--count) COUNT="$2"; shift 2 ;;
    -i|--issues) ISSUES_CSV="$2"; shift 2 ;;
    --base) BASE_REF="$2"; shift 2 ;;
    --worktree-root) WORKTREE_ROOT="$2"; shift 2 ;;
    --branch-prefix) BRANCH_PREFIX="$2"; shift 2 ;;
    --sort)
      SORT_ORDER="$2"
      [[ "$SORT_ORDER" == "oldest" || "$SORT_ORDER" == "newest" ]] || die "--sort must be oldest or newest"
      shift 2
      ;;
    -l|--label) LABELS+=("$2"); shift 2 ;;
    -S|--search) EXTRA_SEARCH="$2"; shift 2 ;;
    --no-fetch) DO_FETCH=0; shift ;;
      --sequential) PARALLEL=0; shift ;;
      --wait) WAIT_ALL=1; shift ;;
    --reuse) REUSE_EXISTING=1; shift ;;
    --log-dir) LOG_DIR="$2"; shift 2 ;;
    --prompt-extra) PROMPT_TAIL="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --print-only) shift ;; # documented for symmetry; --print is always passed
    --model) MODEL="$2"; shift 2 ;;
    --skip-pr-instructions) SKIP_PR_INSTRUCTIONS=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "unknown argument: $1 (use --help)" ;;
  esac
done

[[ -n "$COUNT" || -n "$ISSUES_CSV" ]] || die "specify --count N or --issues n,n,..."
[[ -n "$COUNT" && -n "$ISSUES_CSV" ]] && die "use only one of --count or --issues"
if [[ -n "$COUNT" ]]; then
  [[ $COUNT =~ ^[0-9]+$ ]] || die "--count must be a non-negative integer"
  [[ "$COUNT" -gt 0 ]] || die "--count must be at least 1"
fi

require_gh
command -v jq >/dev/null 2>&1 || die "jq not found (brew install jq)"
AGENT_BIN="$(resolve_cursor_agent)"

if ! git rev-parse --git-common-dir >/dev/null 2>&1; then
  die "run this from inside a git checkout (worktree) of sprocket"
fi

BARE_OR_COMMON="$(git rev-parse --git-common-dir)"
BARE_OR_COMMON="$(cd "$BARE_OR_COMMON" && pwd)"
TOPLEVEL="$(git rev-parse --show-toplevel)"
TOPLEVEL="$(cd "$TOPLEVEL" && pwd)"
REPOROOT="$(cd "$TOPLEVEL/.." && pwd)"

if [[ -z "$WORKTREE_ROOT" ]]; then
  WORKTREE_ROOT="${REPOROOT}/.agent-issue-worktrees"
fi
WORKTREE_ROOT="$(mkdir -p "$WORKTREE_ROOT" 2>/dev/null; cd "$WORKTREE_ROOT" && pwd)"

# Branch name on GitHub for gh pr create --base (BASE_REF is usually origin/main)
BASE_BRANCH="${BASE_REF#origin/}"

if [[ -n "$LOG_DIR" ]]; then
  mkdir -p "$LOG_DIR"
  LOG_DIR="$(cd "$LOG_DIR" && pwd)"
fi

SEARCH_QUERY="sort:created-asc is:issue is:open"
if [[ "$SORT_ORDER" == "newest" ]]; then
  SEARCH_QUERY="sort:created-desc is:issue is:open"
fi
if [[ -n "$EXTRA_SEARCH" ]]; then
  SEARCH_QUERY+=" ${EXTRA_SEARCH}"
fi

collect_issue_json() {
  local num="$1"
  gh issue view "$num" --repo "$REPO" --json number,title,body,url
}

issue_list_numbers() {
  local -a args=(issue list --repo "$REPO" --limit "$COUNT" --json number --search "$SEARCH_QUERY")
  local l
  for l in "${LABELS[@]}"; do
    args+=(--label "$l")
  done
  gh "${args[@]}" | jq -r '.[].number'
}

build_prompt() {
  local json="$1"
  local number title body url
  number="$(echo "$json" | jq -r '.number')"
  title="$(echo "$json" | jq -r '.title')"
  body="$(echo "$json" | jq -r '.body // ""')"
  url="$(echo "$json" | jq -r '.url')"

  if [[ "$SKIP_PR_INSTRUCTIONS" -eq 0 ]]; then
    cat <<EOF
You are working in a dedicated git worktree for this task.

Read AGENTS.md (repo root) and follow repository conventions.

GitHub issue #${number}: ${title}
${url}

--- Issue body ---
${body}
--- End issue body ---

Implement a fix or the requested change. Keep scope tight to this issue.

When finished:
1. Run relevant tests or checks if they exist for your changes.
2. Commit with a message that references #${number} (e.g. "Fix: … (#${number})").
3. Push: \`git push -u origin HEAD\`

4. **Open a pull request** (required). From this worktree, after a successful push, use GitHub CLI:
   - Preferred: \`gh pr create --repo ${REPO} --base ${BASE_BRANCH} --fill\` (uses your commit title/body).
   - Or explicit: \`gh pr create --repo ${REPO} --base ${BASE_BRANCH} --title "Fix: <summary> (#${number})" --body "Fixes #${number}\n\n<context for reviewers>"\`
   - Use \`--draft\` if the change is not ready for full review.

If \`gh\` is not available in this environment, say so in your final message; the human will run \`${SCRIPT_DIR}/agent-issue-worktrees.sh pr ${number}\` from the main repo checkout.
EOF
  else
    cat <<EOF
You are working in a dedicated git worktree for this task.

Read AGENTS.md (repo root) and follow repository conventions.

GitHub issue #${number}: ${title}
${url}

--- Issue body ---
${body}
--- End issue body ---

Implement a fix or the requested change. Keep scope tight to this issue.
When finished: run relevant tests or checks if they exist for your changes, commit with a message that references #${number}, and push your branch to origin.
EOF
  fi
  if [[ -n "$PROMPT_TAIL" ]]; then
    printf '\n%s\n' "$PROMPT_TAIL"
  fi
}

run_agent() {
  local wt="$1"
  local prompt="$2"
  local issue="$3"
  local logfile="${LOG_DIR:+$LOG_DIR/issue-${issue}.log}"
  local -a cmd=("$AGENT_BIN" --print --force --trust --workspace "$wt")
  AGENT_PID=""
  if [[ -n "$MODEL" ]]; then
    cmd+=(--model "$MODEL")
  fi
  if ((${#AGENT_EXTRA_ARGS[@]})); then
    cmd+=("${AGENT_EXTRA_ARGS[@]}")
  fi
  cmd+=("$prompt")

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[dry-run] would run: ${cmd[0]} ... --workspace $wt \"<prompt ${#prompt} chars>\""
    return 0
  fi

  if [[ "$PARALLEL" -eq 0 ]]; then
    log "issue #${issue}: running agent (sequential)"
    if [[ -n "$logfile" ]]; then
      "${cmd[@]}" >"$logfile" 2>&1 || die "cursor-agent failed for issue #${issue} (see $logfile)"
    else
      "${cmd[@]}" || die "cursor-agent failed for issue #${issue}"
    fi
    return 0
  fi

  if [[ -n "$logfile" ]]; then
    log "issue #${issue}: logging to $logfile"
    "${cmd[@]}" >"$logfile" 2>&1 &
    AGENT_PID=$!
  else
    log "issue #${issue}: starting agent in background"
    "${cmd[@]}" &
    AGENT_PID=$!
  fi
}

prepare_worktree() {
  local issue="$1"
  local branch="${BRANCH_PREFIX}-${issue}"
  local path="${WORKTREE_ROOT}/issue-${issue}"

  if [[ "$REUSE_EXISTING" -eq 1 ]]; then
    [[ -d "$path/.git" || -f "$path/.git" ]] || die "reuse requested but missing git worktree at $path"
    log "issue #${issue}: reusing $path"
    printf '%s' "$path"
    return
  fi

  [[ ! -e "$path" ]] || die "path already exists: $path (remove it, pick another --worktree-root, or use --reuse)"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[dry-run] git -C $BARE_OR_COMMON worktree add -b $branch $path $BASE_REF"
    printf '%s' "$path"
    return
  fi

  git -C "$BARE_OR_COMMON" worktree add -b "$branch" "$path" "$BASE_REF" >/dev/null
  printf '%s' "$path"
}

ISSUE_NUMS=()
if [[ -n "$ISSUES_CSV" ]]; then
  IFS=',' read -r -a _raw <<< "$ISSUES_CSV"
  for n in "${_raw[@]}"; do
    n="$(echo "$n" | tr -d '[:space:]')"
    [[ $n =~ ^[0-9]+$ ]] || die "invalid issue number: $n"
    ISSUE_NUMS+=("$n")
  done
else
  while IFS= read -r n; do
    [[ -n "$n" ]] && ISSUE_NUMS+=("$n")
  done < <(issue_list_numbers)
fi

[[ ${#ISSUE_NUMS[@]} -gt 0 ]] || die "no issues resolved (check repo, labels, or auth)"

if [[ "$DO_FETCH" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  remote="$(git -C "$BARE_OR_COMMON" remote | head -1 || true)"
  [[ -n "$remote" ]] || die "no git remote in $BARE_OR_COMMON"
  log "fetching $remote (set --no-fetch to skip)..."
  git -C "$BARE_OR_COMMON" fetch "$remote" --prune --quiet || die "git fetch failed"
fi

PIDS=()
MANIFEST_LINES=()
for issue in "${ISSUE_NUMS[@]}"; do
  json="$(collect_issue_json "$issue")"
  prompt="$(build_prompt "$json")"
  wt="$(prepare_worktree "$issue")"
  if [[ "$DRY_RUN" -eq 0 ]]; then
    entry="$(echo "$json" | jq --arg wt "$wt" --arg br "${BRANCH_PREFIX}-${issue}" \
      '{number, title, issue_url: .url, worktree: $wt, branch: $br}')"
    MANIFEST_LINES+=("$entry")
  fi
  run_agent "$wt" "$prompt" "$issue"
  if [[ -n "${AGENT_PID:-}" ]]; then
    PIDS+=("$AGENT_PID")
  fi
done

if [[ "$DRY_RUN" -eq 0 && ${#PIDS[@]} -gt 0 ]]; then
  if [[ "$PARALLEL" -eq 1 ]]; then
    log "started ${#PIDS[@]} agent(s) in background: ${PIDS[*]}"
  fi
  if [[ "$WAIT_ALL" -eq 1 ]]; then
    ec=0
    for pid in "${PIDS[@]}"; do
      wait "$pid" || ec=1
    done
    [[ "$ec" -eq 0 ]] || log "warning: one or more agents exited non-zero"
  elif [[ "$PARALLEL" -eq 1 ]]; then
    log "tip: re-run with --wait to block until all agents finish, or: wait ${PIDS[*]}"
  fi
fi

if [[ "$DRY_RUN" -eq 0 && ${#MANIFEST_LINES[@]} -gt 0 ]]; then
  issues_json="$(printf '%s\n' "${MANIFEST_LINES[@]}" | jq -s '.')"
  jq -n \
    --arg created_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg github_repo "$REPO" \
    --arg worktree_root "$WORKTREE_ROOT" \
    --arg base_ref "$BASE_REF" \
    --arg base_branch "$BASE_BRANCH" \
    --arg helper_script "${SCRIPT_DIR}/agent-issue-worktrees.sh" \
    --argjson issues "$issues_json" \
    '{created_at, github_repo, worktree_root, base_ref, base_branch, helper_script, issues}' \
    >"${WORKTREE_ROOT}/run-latest.json"
  log ""
  log "======== Next steps / review ========="
  log "Manifest: ${WORKTREE_ROOT}/run-latest.json"
  log "Summary table:  ${SCRIPT_DIR}/agent-issue-worktrees.sh list"
  for issue in "${ISSUE_NUMS[@]}"; do
    wt_path="${WORKTREE_ROOT}/issue-${issue}"
    br="${BRANCH_PREFIX}-${issue}"
    log "--- Issue #${issue} (${br}) ---"
    log "  cd $(printf %q "$wt_path")"
    log "  cursor -n $(printf %q "$wt_path")"
    log "  $(printf %q "${SCRIPT_DIR}/agent-issue-worktrees.sh") pr ${issue}   # push + gh pr create"
  done
fi
