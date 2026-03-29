# Agent Ops Index

Updated: March 18, 2026

## Purpose

This file is the shortest current map for humans and agents operating in the Sprocket repo.

Read this before diving into older `reports/` material.

## Current State in One Page

Sprocket is now operating as a **single application + infrastructure monorepo**:
- application code remains under `core/`, `common/`, `clients/`, and `microservices/`
- infrastructure code now lives under `infra/`
- hosted verification harnesses live under `scripts/harness/`
- release planning and rollout notes live under `reports/`

The repo has already made meaningful progress on hosted verification:
- Tier 0 hosted smoke exists and has been run against `main`
- Tier 1 League Read exists and has passed on hosted `main`
- Tier 1 Scrim Lifecycle exists and has been extended to a four-actor Rocket League path
- Tier 1 Replay Submission exists and prior work identified/fixed a server-side async timeout path in app code

The main remaining operational problem is **agent operating surface quality**, not total lack of harness work.

## Read These First

### 1. Progress / source-of-truth log
- `reports/agent-harness-progress.md`

Use this for:
- what has already been implemented
- what was validated
- what blockers were discovered
- what next actions were previously recommended

### 2. Harness and lane contract
- `scripts/harness/README.md`
- `scripts/harness/service-manifest.json`
- `environments/local-dev.json`
- `environments/main-prod.json`
- `environments/v15-beta.json`

Use these for:
- current verification commands
- env contract shape
- service/dependency metadata
- lane-specific verification entrypoints
- machine-readable lane status and profile expectations

### 3. Local runtime
- `LOCAL_DEVELOPMENT.md`
- `docker-compose.yml`
- `scripts/setup-local.sh`

Use these for:
- local boot
- service dependencies
- common local debugging commands

### 4. Hosted lane definitions
- `reports/release-environment-contracts.md`
- `reports/release-verification-matrix.md`
- `reports/v15-beta-rollout-checklist.md`

Use these for:
- `main` vs `v1.5` hosted-lane expectations
- isolation requirements
- rollout gates and verification responsibilities

### 5. Infrastructure shape
- `infra/README.md`
- `infra/foundation/src/index.ts`
- `infra/platform/src/config/services/*.json`
- `infra/platform/src/Platform.ts`

Use these for:
- current cloud/foundation topology
- current infra topology
- service config templates
- monolith/beta deployment mapping

## What To Treat As Background

These files still contain useful thinking, but they are no longer the fastest way to orient for implementation:
- broad strategy docs that predate harness implementation
- early monorepo evaluation docs now superseded by the actual migration
- older notes that refer to `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra`

If an older doc conflicts with repo reality, prefer repo reality.

## Current High-Value Work Categories

### A. Agent-surface improvements
Examples:
- root-level agent docs
- manifest files
- command normalization
- doc de-duplication
- stale-path cleanup

### B. Verification improvements
Examples:
- more reliable hosted harness execution
- artifact collection improvements
- env profile cleanup
- clearer pass/fail summaries

### C. Release-lane enablement
Examples:
- `main` vs `v1.5` comparison tooling
- beta-lane contracts
- canary / staging preparation
- promotion gate automation

### D. Focused app fixes justified by harnesses
Examples:
- issues directly surfaced by Tier 0 / Tier 1 verification
- lane-specific runtime mismatches
- deployment or async behavior that blocks validation

## Practical Defaults for Agents

If you do not know where to start:

1. Check branch + worktree.
2. Read `AGENTS.md`.
3. Read `reports/agent-harness-progress.md`.
4. Read `scripts/harness/README.md`.
5. Read only the service/lane docs relevant to your task.

## Most Useful Current Commands

### Local
```bash
./scripts/setup-local.sh
docker-compose up -d
docker-compose logs -f core
```

### Hosted verification
```bash
npm run verify:tier0 -- local-dev
npm run verify:tier0 -- main-prod
npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env league
npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env scrim
npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env submission
npm run verify:all -- main-prod /absolute/path/to/tier1.env
```

## Recommended Next Repo Improvements

In priority order:
1. normalize root `dev:*` and `verify:*` commands
2. keep `scripts/harness/service-manifest.json` current as the machine-readable truth surface
3. convert more release-lane assumptions from prose into machine-readable environment metadata
4. continue deleting or updating stale references to the former standalone infra repo
5. add lightweight handoff/update rules whenever a task materially changes lane assumptions or proof expectations

## Update Rule

Update this file when one of the following changes:
- canonical starting docs
- default commands
- lane definitions
- repo operating model
- where agents should look first for current truth
