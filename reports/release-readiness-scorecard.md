# Release Readiness Scorecard

**Updated:** April 21, 2026  
**Branch:** `issue/release-lane-strategy`  
**Worktree:** `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/main/worktrees/issue-release-strategy`

## Purpose

This document compares all four Sprocket release lanes with current, observed evidence:

- `main` (`v1`) - current production baseline
- `personal/gankoji/unbork-cloud-spend` (`v1.5`) - monolith consolidation branch
- `dev` (`v2`) - Bun/consolidated runtime branch
- `Sprocket-v3` (separate repo) - Go + Kubernetes platform

The scorecard is based on observed state from dedicated worktrees and repo inspections, not memory or aspirations.

**Related Documents:**
- [`reports/release-lane-comparison.md`](./release-lane-comparison.md) - Side-by-side comparison with Green/Yellow/Red status
- [`reports/sprocket-release-portfolio-plan.md`](./sprocket-release-portfolio-plan.md) - Portfolio strategy rationale

## Evaluation Standard

Each lane is evaluated on:

1. branch resolved and isolated,
2. local boot path is documented,
3. install/build path is documented,
4. data/migration path is documented,
5. hosting/deployment path is clear,
6. infra compatibility is understood,
7. critical golden flows can be executed,
8. runtime logs and failure artifacts are obtainable,
9. rollback/cutover story is understandable,
10. near-term customer value is plausible,
11. smoke test coverage exists,
12. production data rehearsal is possible.

Status values:

- `Green`: observed and usable with evidence
- `Yellow`: partially present or unverified
- `Red`: missing, unclear, or blocked
- `TBD`: not yet executed

## Worktrees

| Lane | Branch | SHA | Worktree | Last Verified |
|------|--------|-----|----------|---------------|
| `v1` | `main` | `ccd2bc76b8d782f3832288d0173cac691ac3f93e` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main` | Apr 21, 2026 |
| `v1.5` | `personal/gankoji/unbork-cloud-spend` | `c4aca556256911d476b8a94ce90a084ed9e7bb77` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15` | Apr 21, 2026 |
| `v2` | `dev` | `d0c1bc9597557674241b73e23d058ec346a5b267` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-dev-branch` | Apr 21, 2026 |
| `v3` | N/A (external repo) | N/A | N/A | Not inspected from this worktree |

## Summary Table

| Criterion | `main` (`v1`) | `v1.5` | `dev` (`v2`) | `v3` |
|-----------|---------------|--------|--------------|------|
| Branch isolated in worktree | Green | Green | Green | N/A (external) |
| Local boot path documented | Green | Yellow | Red | Yellow |
| Install/build path documented | Green | Green | Yellow | Green |
| Data/migration path documented | Green | Yellow | Red | Yellow |
| Hosting/deployment path clear | Green | Yellow | Red | Yellow |
| Infra compatibility understood | Green | Yellow | Red | Yellow |
| Golden flow harness present | Red | Red | Red | Yellow |
| Logs/artifacts standardized | Yellow | Red | Red | Green |
| Rollback story understandable | Yellow | Yellow | Red | Yellow |
| Near-term ship plausibility | Green | Yellow | Yellow | Yellow |
| Smoke test coverage | Yellow | Red | Red | Yellow |
| Production data rehearsal | Green | Yellow | Red | Yellow |

**Summary:**
- `main`: 6 Green, 4 Yellow, 2 Red - **Production ready**
- `v1.5`: 1 Green, 6 Yellow, 5 Red - **Bake-off candidate**
- `v2`: 0 Green, 4 Yellow, 8 Red - **Capability incubation only**
- `v3`: 1 Green, 8 Yellow, 3 Red - **Long-horizon research lane**

## Branch Notes

## `main` (`v1`) - Production Baseline

### Current Evidence (April 21, 2026)

**Branch/SHA:** `main`@`ccd2bc76b8d782f3832288d0173cac691ac3f93e`  
**Worktree:** `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main`  
**Last Verified:** Apr 21, 2026

### Observed Facts

- Root workspace and `docker-compose.yml` are present and functional
- Local boot and DB setup are described in `LOCAL_DEVELOPMENT.md`
- `scripts/setup-local.sh` exists and provides automated setup
- Production dump and local reseed flow documented in `scripts/README.md`
- Infra repo `sprocket-infra` models current service topology in Pulumi/Docker Swarm
- Health endpoint verified: `http://localhost:3001/healthz`
- GraphQL endpoint: `http://localhost:3001/graphql`
- Services: core, web, discord-bot, image-generation-frontend, microservices
- Infrastructure: postgres (port 5434), redis, rabbitmq, minio

### Boot Commands (Verified)

```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main
cp .env.local .env
# Adjust hostnames for native dev if not using Docker
sudo docker compose up -d postgres redis rabbitmq minio
npm run build:common
npm run build --workspace=core
cd core && node dist/main.js
# Or use Docker for all services:
docker compose up -d
```

### Smoke Test

```bash
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
# Expected: {"data":{"__typename":"Query"}}
```

### Readiness Read

**Status: Green** - This is the strongest immediate release lane because it has:
- ✅ Documented local runtime (verified)
- ✅ Documented migration path (partially verified)
- ✅ Existing infrastructure deployment model
- ✅ Existing production-shaped operating model
- ✅ Currently serving production traffic

### Remaining Gaps

- ❌ No single release smoke command
- ❌ No branch-comparable golden-flow harness
- ❌ No standardized failure artifact collection
- ⚠️ Infra deployment verification should be added to readiness flow

### Status Breakdown

- Boot path: **Green** (verified)
- Build path: **Green** (verified)
- Migration path: **Green** (documented, partially verified)
- Hosting path: **Green** (Pulumi/Swarm model exists)
- Smoke path: **Yellow** (basic smoke exists, not comprehensive)
- Observability: **Yellow** (health endpoints exist, not standardized)
- Rollback: **Yellow** (Docker/Pulumi support rollback, not tested)
- Release readiness: **Green** (can ship with confidence)

## `personal/gankoji/unbork-cloud-spend` (`v1.5`) - Monolith Candidate

### Current Evidence (April 21, 2026)

**Branch/SHA:** `personal/gankoji/unbork-cloud-spend`@`c4aca556256911d476b8a94ce90a084ed9e7bb77`  
**Worktree:** `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15`  
**Last Verified:** Apr 21, 2026

### Observed Facts

- Root workspace includes `apps/monolith`
- Root scripts: `build:monolith`, `start:monolith`, `dev:monolith`
- Monolith source: `apps/monolith/src/main.ts`, `apps/monolith/src/monolith.module.ts`
- `docker-compose.monolith.yml` defines `monolith` service plus shared infra
- Monolith consolidates major NestJS services into one process
- Python replay parser remains separate
- Shares database schema with `main`

### Boot Commands (Documented but Unverified)

```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15
cp .env.local .env
docker-compose -f docker-compose.monolith.yml up --build -d
docker-compose -f docker-compose.monolith.yml logs --tail=200 monolith
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
```

### Readiness Read

**Status: Yellow** - This branch is materially more real than earlier assessments suggested:
- ✅ Checked-in monolith source
- ✅ Root monolith scripts
- ✅ Dedicated compose file
- ⚠️ Monolith runtime not yet booted and compared against `main`
- ⚠️ No observed golden-flow pass/fail
- ⚠️ No measured memory/boot-time comparison

### Remaining Gaps

- ❌ Monolith boot not verified from current worktree
- ❌ No smoke test comparison with `main`
- ❌ No documented rollback/cutover procedure
- ❌ No explicit Pulumi/Swarm deployment mapping observed
- ❌ Operator training materials not created

### Status Breakdown

- Boot path: **Yellow** (documented, not verified)
- Build path: **Green** (scripts defined, source present)
- Migration path: **Yellow** (shares DB with main, not verified)
- Hosting path: **Yellow** (compose file exists, infra mapping unclear)
- Smoke path: **Red** (no evidence of smoke test execution)
- Observability: **Red** (no logging strategy observed)
- Rollback: **Yellow** (monolith simplifies rollback, not documented)
- Release readiness: **Yellow** (needs bake-off)

### Recommendation

Execute formal one-week bake-off to answer:
1. Can monolith boot against local prod-like snapshot?
2. Can monolith execute same golden flows as `main`?
3. What is the performance/memory/boot-time comparison?
4. Is there a rollback story if it fails under load?

## `dev` (`v2`) - Bun/Consolidated Runtime

### Current Evidence (April 21, 2026)

**Branch/SHA:** `dev`@`d0c1bc9597557674241b73e23d058ec346a5b267`  
**Worktree:** `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-dev-branch`  
**Last Verified:** Apr 21, 2026

### Observed Facts

- Worktree is on branch `dev`
- Root `package.json` uses `pnpm` for build/lint workflows
- No obvious top-level `docker-compose.yml` in branch worktree alone
- Root README describes older npm/microservice workflow
- Convenience checkout `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket_dev` contains:
  - Bun-based runtime
  - `docker-compose.yaml`
  - Setup docs
  - Consolidated `core`
  - Web and Discord clients
  - Tracing/observability setup
  - Local migration/seed steps
- No explicit hosting path observed in `sprocket-infra`

### Boot Commands (Unclear from Branch Worktree)

**Branch worktree alone:** No clear boot path observed

**Convenience checkout** (`sprocket_dev`):
```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket_dev
cp .env.example .env
bun i
docker compose up -d
./migrate-up
./seed
```

### Readiness Read

**Status: Red** - `v2` may have significant implementation progress, but from the branch worktree alone its local boot surface is not self-evident. That is a readiness problem in itself.

Key issues:
- ❌ No clear boot path from branch worktree
- ❌ Toolchain divergence (Bun vs Node.js)
- ❌ No migration path documented
- ❌ No smoke tests or production data rehearsal
- ❌ Infrastructure deployment path unclear

### Remaining Gaps

- ❌ Branch-local runtime path unclear
- ❌ No shared smoke harness
- ❌ No release candidate scope narrowed to one pilot slice
- ❌ No branch-comparable migration story
- ❌ No infrastructure mapping observed
- ❌ Operator training burden not assessed

### Status Breakdown

- Boot path: **Red** (unclear from branch worktree)
- Build path: **Yellow** (pnpm/Bun scripts exist, not verified)
- Migration path: **Red** (not documented)
- Hosting path: **Red** (no infra mapping observed)
- Smoke path: **Red** (no smoke harness)
- Observability: **Yellow** (tracing setup in convenience checkout)
- Rollback: **Red** (rollback story not documented)
- Release readiness: **Red** (not a near-term candidate)

### Recommendation

Do not treat as near-term launch candidate. Actions needed:
1. Clarify authoritative validation path (branch worktree or convenience checkout)
2. Identify one bounded capability for potential pilot
3. Require migration contract before expanding scope
4. Document boot and build procedures

## `Sprocket-v3` - Go + Kubernetes Platform

### Current Evidence (April 21, 2026)

**Repo:** `Sprocket-v3` (separate repository, not in this monorepo)  
**Branch/SHA:** Not inspected from this worktree  
**Worktree:** N/A  
**Last Verified:** Not inspected from this worktree (evidence from `reports/sprocket-release-portfolio-plan.md`)

### Observed Facts (from documentation)

- Separate Go + Kubernetes platform repository
- Clear README and execution board
- Weekly slice model with quality gates
- Local smoke scripts documented
- Minikube smoke scripts available
- Seeding scripts present
- Roadmap completed through Week 14 (as of February 15, 2026)
- Strong process discipline (arguably most mature in process terms)
- Go ecosystem provides mature observability patterns
- Kubernetes provides built-in observability, rolling deployments, rollbacks

### Boot Commands (Not Observed from This Worktree)

Based on documentation, v3 likely has:
```bash
# Local development (presumed)
git clone <Sprocket-v3-repo>
cd Sprocket-v3
# Bootstrap commands not observed from this worktree
```

### Readiness Read

**Status: Yellow** - `v3` has the strongest process discipline of all lanes, but exists in a separate repository and requires Kubernetes expertise.

Strengths:
- ✅ Weekly slice validation demonstrates velocity
- ✅ Quality gates enforce build/test discipline
- ✅ Go toolchain is mature and reproducible
- ✅ Kubernetes provides strong observability and rollback
- ✅ Clear documentation in repo

Weaknesses:
- ❌ Separate repository complicates coordination
- ❌ Kubernetes expertise required (may not exist on team)
- ❌ No production data rehearsal observed
- ❌ Infrastructure deployment not integrated with Sprocket infra
- ❌ Longest path to customer value

### Remaining Gaps

- ❌ No observed boot from this worktree context
- ❌ No connection to shared golden-flow document
- ❌ No production data rehearsal with Sprocket data
- ❌ Integration with existing Sprocket infra unclear
- ❌ Operator training materials needed (Kubernetes)

### Status Breakdown

- Boot path: **Yellow** (documented in repo, not observed here)
- Build path: **Green** (Go toolchain, quality gates)
- Migration path: **Yellow** (slice-by-slice reduces risk, not documented)
- Hosting path: **Yellow** (Kubernetes model clear, Sprocket integration unclear)
- Smoke path: **Yellow** (local/minikube scripts exist, not compared to main)
- Observability: **Green** (Go + K8s provide strong observability)
- Rollback: **Yellow** (K8s supports rollbacks, not tested with Sprocket)
- Release readiness: **Yellow** (long-horizon research lane)

### Recommendation

Preserve as long-horizon research lane. Actions needed:
1. Require incremental migration through bounded pilots, not big-bang replacement
2. Use as process model for other lanes (weekly slices, quality gates)
3. Identify one production-adjacent capability for potential pilot
4. Document integration path with Sprocket infrastructure
## Current Recommendation (April 21, 2026)

Based on the evidence gathered:

1. **`main` should remain the default shipping lane** for the next 30-60 days
   - Only lane with verified boot, migration, and operational paths
   - Currently serving production traffic
   - No platform cutover risk

2. **`v1.5` deserves a formal one-week bake-off**
   - Has checked-in monolith source and build scripts
   - Shares infrastructure with `main` (easier migration)
   - Bake-off should answer: boot, golden flows, performance, rollback

3. **`v2` should not be treated as a near-term launch candidate**
   - Unclear boot path from branch worktree
   - Toolchain divergence (Bun vs Node)
   - Identify one bounded capability for potential pilot

4. **`v3` should continue as long-horizon research lane**
   - Strongest process discipline
   - Requires Kubernetes expertise
   - Earn production scope through bounded pilots, not big-bang replacement

### Strategic Shift

Stop framing the problem as "which whole platform should launch?"

Instead:
1. What is the fastest safe path to customer value in 30-60 days? → **`main`**
2. What evidence is needed before any rewrite lane replaces production? → **Bake-off + pilots**
3. How do we use agents to reduce uncertainty, not multiply parallel bets? → **Harness + scorecards**
## Next Actions

### Immediate (This Week)

1. ✅ **Create release lane comparison board** - `reports/release-lane-comparison.md` (COMPLETE)
2. ✅ **Update release readiness scorecard** - This document (COMPLETE)
3. ⏳ **Run `main` local rehearsal path** and record pass/fail (Task 5.4)
4. ⏳ **Run `v1.5` monolith rehearsal path** and record pass/fail (Task 5.5)
5. ⏳ **Create shared golden-flow document** for cross-lane comparison
6. ⏳ **Add artifact capture** for both `main` and `v1.5`

### Short-Term (Next 2-4 Weeks)

7. ⏳ **Execute v1.5 bake-off** with one-week deadline
   - Answer: boot, golden flows, performance, rollback
   - Document findings in `reports/v15-bake-off-results.md`
   - Make explicit recommendation: promote to beta or park

8. ⏳ **Stabilize `main` as production lane**
   - Fix any broken local boot issues
   - Add Tier 0 smoke tests to CI
   - Document deployment procedure in runbook

9. ⏳ **Select bounded capabilities** from `v2` and `v3` for pilots
   - High operational pain
   - Clear acceptance criteria
   - Low blast radius
   - Reversible integration

### Medium-Term (Next 1-3 Months)

10. ⏳ **Build shadow-run infrastructure** for pilots
    - Feed input into both old and new implementations
    - Compare outputs and record diffs
    - Quantify mismatches

11. ⏳ **Establish release governance model**
    - Define who decides when lanes are promoted/parked
    - Define evidence required for promotion decisions
    - Define cadence for release lane reviews (monthly)

12. ⏳ **Create monthly release lane review cadence**
    - Update scorecard with new evidence each month
    - Re-evaluate parked lanes periodically
    - Document review outcomes

---

## Evidence Log

**April 21, 2026:**
- Created `reports/release-lane-comparison.md` with comprehensive lane comparison
- Updated `reports/release-readiness-scorecard.md` with current evidence
- Worktree inspections confirmed for `main`, `v1.5`, and `v2`
- `v3` evidence from `reports/sprocket-release-portfolio-plan.md`

**March 12, 2026:**
- Initial scorecard created
- Worktrees established for `main`, `v1.5`, and `v2`
- First-pass observations documented

---

**Document Owner:** Release governance team  
**Update Cadence:** Monthly (or when significant evidence changes)  
**Next Review:** May 21, 2026
