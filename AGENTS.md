# Sprocket Agent Guide

This file is the repo-level operating surface for AI coding agents working in `sprocket`.

## Primary Goals

There are two standing goals in this repository:

1. **Long-term platform safety:** build enough verification and environment isolation to support staging, beta, canary, or A/B style release confidence.
2. **Short-term agent effectiveness:** make the repo easy for many agents to inspect, change, validate, and hand off safely.

If you are making changes, optimize for both goals when possible.

---

## Repo Shape

### Application code
- `core/`
- `common/`
- `clients/web/`
- `clients/discord-bot/`
- `clients/image-generation-frontend/`
- `microservices/*`

### Harness / verification
- `scripts/harness/` — hosted verification entrypoints and env-driven smoke scripts
- `artifacts/` — ignored output root for collected verification evidence
- `reports/` — planning, environment contracts, rollout notes, and progress logs

### Infrastructure
- `infra/global/`
- `infra/layer_1/`
- `infra/layer_2/`
- `infra/platform/`

Infra has been migrated into this monorepo from the former standalone `sprocket-infra` repo. Prefer paths under `infra/` over older docs that still reference the external location.

---

## Canonical Starting Points

If you need context, read these first before wandering the repo:

1. `reports/agent-ops-index.md` — current navigation guide for humans and agents
2. `reports/agent-harness-progress.md` — running log of what has been implemented and validated
3. `scripts/harness/README.md` — current hosted verification contract
4. `scripts/harness/service-manifest.json` — machine-readable service/environment metadata
5. `environments/*.json` — lane contracts for local-dev, main-prod, and planned beta lanes
6. `LOCAL_DEVELOPMENT.md` — current local dev setup and docker-compose workflow
7. `reports/release-environment-contracts.md` — hosted lane expectations for `main` and `v1.5`

Treat the files above as the current operating surface. Treat older speculative docs in `reports/` as background unless they are explicitly referenced by one of the files above.

---

## Worktree and Branch Guidance

This repo is actively used with multiple worktrees. Do not assume the current checkout is the only active lane.

Observed common worktrees:
- `sprocket` — often used for active codex/Hermes changes
- `sprocket-main` — `main` comparison lane
- `sprocket-v15` — `personal/gankoji/unbork-cloud-spend` (`v1.5`) comparison / bake-off lane
- `sprocket-dev-branch` — `dev` comparison lane

### Rules
- Confirm the current branch before editing.
- If the task is lane-specific, prefer the dedicated worktree for that lane.
- Do not silently make a `main`-lane assumption when the task concerns `v1.5`, beta rollout, or cutover comparisons.
- When summarizing work, always mention **path + branch + commit** if they matter.

---

## Safety Envelope

### Safe autonomous changes
Usually safe without extra approval if scoped and validated:
- docs and agent instructions
- harness scripts
- verification metadata / manifests
- non-destructive test improvements
- local developer experience improvements
- targeted bugfixes with clear proof

### Requires human review before merge / rollout
- production infra behavior changes
- hosted environment promotion logic
- schema or migration changes with real data implications
- auth / identity / impersonation changes
- queue namespace or storage target changes
- anything that could affect live user traffic or side effects

### Human-owned / escalate by default
- secrets management
- production credential handling
- destructive data operations
- unclear rollback situations
- cross-lane traffic sharing decisions

---

## Required Proof Expectations

For meaningful changes, provide the smallest proof loop that matches risk.

### Docs-only changes
- confirm referenced paths/commands exist
- mention any stale references corrected

### Harness / verification changes
- run script syntax checks or targeted execution where possible
- name the exact command used
- say where artifacts land

### App / service changes
- run targeted tests if available
- run at least one relevant smoke or validation command when feasible
- record any blocked proof and why it was blocked

### Infra changes
- prefer non-destructive validation first
- identify stack/lane affected
- explicitly state what was **not** validated locally

---

## Multi-Agent Coordination Rules

When multiple agents may work concurrently:

1. **Claim a narrow scope.** State the file set or subsystem you are touching.
2. **Prefer additive docs/manifests over broad refactors** unless asked otherwise.
3. **Avoid cross-cutting cleanup churn** in unrelated files.
4. **Do not rewrite long planning docs wholesale** unless the task is specifically doc consolidation.
5. **Log discoveries in repo files, not only chat.** Prefer updating the appropriate `reports/*.md` file if the work changes repo understanding.
6. **Call out stale docs immediately.** Stale paths and stale environment assumptions are high-cost agent hazards.

---

## Validation Entry Points

### Local runtime
- `npm run dev:up`
- `npm run dev:down`
- `npm run dev:status`
- `npm run dev:logs -- <service>`
- `npm run dev:smoke`
- `./scripts/setup-local.sh` remains available for full local bootstrap

### Hosted verification
- `npm run verify:tier0 -- local-dev`
- `npm run verify:tier0 -- main-prod`
- `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env all`
- `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env league`
- `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env scrim`
- `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env submission`
- `npm run verify:all -- main-prod /absolute/path/to/profile.env`

Backward-compatible aliases still exist under `harness:*`.
Harness env profiles live under `scripts/harness/env/`, while lane contracts live under `environments/` and real secret-bearing Tier 1 profiles should remain uncommitted.

---

## Known Current Gaps

These are real repo gaps, not user mistakes:
- there is not yet a single machine-enforced promotion workflow for `main` -> `v1.5` / beta lanes
- Tier 1 hosted verification still depends on operator-provided credentials, impersonation inputs, and replay fixtures
- some infra-facing docs still reference the former standalone infra repo path
- `reports/` contains both current and historical planning material; use the canonical starting points above to orient yourself

---

## Preferred Agent Workflow

1. Read `reports/agent-ops-index.md`.
2. Confirm repo path, branch, and worktree.
3. Identify whether the task is:
   - local-dev ergonomics,
   - harness/verification,
   - app behavior,
   - infra/platform,
   - or release-lane planning.
4. Read only the minimum additional files needed.
5. Make a narrowly scoped change.
6. Run the smallest convincing proof.
7. Summarize:
   - what changed,
   - what was validated,
   - what remains uncertain,
   - and the recommended next action.

If you improve the repo’s operating surface for future agents, that is valuable work here.