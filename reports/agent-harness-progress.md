# Agent Harness Progress Log

Updated: March 12, 2026

## Purpose

This file is the local running log for work related to making Sprocket more agent-driven.

It should be updated as planning, implementation, and validation progress happens so the conversation does not become the only source of truth.

## Current Artifacts

1. [`reports/openai-harness-engineering-notes.md`](./openai-harness-engineering-notes.md)
   - Summary and commentary on OpenAI's "Harness engineering" article.
2. [`reports/agent-harness-roadmap.md`](./agent-harness-roadmap.md)
   - Concrete phased roadmap for adapting the strategy to Sprocket.
3. [`reports/sprocket-release-portfolio-plan.md`](./sprocket-release-portfolio-plan.md)
   - Strategy for turning `v1`, `v1.5`, `v2`, and `v3` from competing parallel efforts into a staged release portfolio.
4. [`reports/release-execution-plan.md`](./release-execution-plan.md)
   - Concrete branch-by-branch execution plan with worktree setup, scorecards, golden flows, bake-off steps, and migration gates.
5. [`reports/release-readiness-scorecard.md`](./release-readiness-scorecard.md)
   - First-pass observed scorecard comparing `main`, `v1.5`, and `dev` using dedicated worktrees.
6. [`reports/hosting-readiness-assessment.md`](./hosting-readiness-assessment.md)
   - Infra-aware assessment incorporating `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra` and shifting the evaluation from local boot to hostability.
7. [`reports/variant-hosting-strategy.md`](./variant-hosting-strategy.md)
   - Parallel-environment strategy for keeping `main` live while bringing `v1.5` up with isolated real traffic.
8. [`reports/release-golden-flows.md`](./release-golden-flows.md)
   - Shared CUJ/smoke catalogue intended to transfer from `main` to `v1.5`.
9. [`reports/release-verification-automation-plan.md`](./release-verification-automation-plan.md)
   - Pre-code rollout and automation sequence for keeping `main` stable, standing up isolated `v1.5`, and introducing bounded beta traffic.
10. [`reports/release-environment-contracts.md`](./release-environment-contracts.md)
   - Hosted-environment contract for `main` production and the intended isolated `v1.5` beta lane.
11. [`reports/release-verification-matrix.md`](./release-verification-matrix.md)
   - Detailed execution matrix for Tier 0 and Tier 1 verification across `main` and `v1.5`.
12. [`reports/v15-beta-rollout-checklist.md`](./v15-beta-rollout-checklist.md)
   - Verification-first checklist for bringing up `v1.5` as a real beta environment.
13. [`reports/v15-infra-mapping.md`](./v15-infra-mapping.md)
   - Concrete mapping of the `v1.5` monolith branch onto the current `sprocket-infra` production model.

## Current Understanding

The main transferable lesson from the OpenAI article is that better agent output depends on better environment design:

- deterministic boot,
- deterministic validation,
- explicit instructions,
- architectural boundaries,
- artifact collection,
- and recurring cleanup.

For Sprocket specifically, the highest-value initial target is not full autonomy. It is a bounded harness for changes affecting:

- `core`,
- `clients/web`,
- `microservices/submission-service`,
- `microservices/matchmaking-service`.

## Repo Observations Captured So Far

1. The repo already has a workspace root and a `docker-compose.yml` local stack.
2. Several services expose `build`, `dev`, `start`, `lint`, and `test` scripts, but there is no single agent-facing runtime contract.
3. Unit and some integration coverage already exist, but there is not yet a unified smoke/system harness.
4. The local environment depends on shared infra including RabbitMQ, Redis, Postgres, and MinIO.
5. The current likely bottleneck for autonomy is not model capability. It is missing harness structure.
6. Clarification added on March 12, 2026:
   - `v1.5` is a branch in the main `sprocket` repo.
   - `v2` is the `dev` branch in the main `sprocket` repo.
   - `sprocket_dev` is a second local checkout used for workflow convenience, not a separate product line.
7. Current local ref check from this checkout shows `main`, `dev`, and `staging`, but not an obvious local/ref name for `v1.5`.
   - Immediate implication: resolving/fetching the exact `v1.5` branch ref is the first gate in the execution plan.
8. Clarification from user on March 12, 2026:
   - `v1.5` is `personal/gankoji/unbork-cloud-spend`.
9. Worktrees created on March 12, 2026:
   - `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main`
   - `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-dev-branch`
   - `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15`
10. Initial scorecard observations:
   - `main` has the clearest documented local runtime.
   - `v1.5` has checked-in monolith source and a dedicated `docker-compose.monolith.yml`, so it is a real bake-off candidate.
   - `dev` appears less release-ready from the branch worktree alone than from the convenience checkout in `sprocket_dev`.
11. Infra clarification added on March 12, 2026:
   - `v1` is backed by a real Pulumi/Docker Swarm deployment model in `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra`.
   - `v1.5` does not yet have an observed explicit infra deployment mapping.
   - `v2` does not yet have an observed explicit infra deployment mapping.
12. Planning priority shift:
   - hosting/deployment compatibility is now treated as a primary gate, not just local runtime readiness.
13. Variant strategy conclusion added on March 12, 2026:
   - do not send early `v1.5` traffic through the same live async side-effect path as `v1`;
   - use a separate beta environment first.
14. Shared verification direction added on March 12, 2026:
   - establish Tier 0 environment smoke and Tier 1 CUJs on `main`,
   - then transfer the same flow definitions to `v1.5`.
15. Verification planning clarification added on March 12, 2026:
   - smoke/CUJ definitions now exist at the documentation/spec layer;
   - automation is still the next step, not a completed capability.
16. Rollout-sequencing clarification added on March 12, 2026:
   - the immediate work should be verification-first;
   - application-code changes should follow only after hosted smoke and beta-lane automation are in place.
17. Environment-contract clarification added on March 12, 2026:
   - `main` production is now explicitly treated as the multi-service truth lane;
   - `v1.5` beta is explicitly treated as an isolated monolith-based lane.
18. Operational next-step clarification added on March 12, 2026:
   - the next implementation step is no longer “more planning”;
   - it is harness script creation plus `sprocket-infra` mapping for `v1.5`.
19. Harness implementation update on March 12, 2026:
   - initial Tier 0 harness scripts now exist under `scripts/harness/`;
   - root npm scripts now expose the first web/API/dependency/artifact entrypoints.
20. Harness validation update on March 12, 2026:
   - `check-web.sh`, `check-api.sh`, `check-dependencies.sh`, and `collect-artifacts.sh` were syntax-checked and dry-run validated with a temporary artifact root.
21. `v1.5` infra mapping update on March 12, 2026:
   - the safest initial beta topology is `monolith` + `replay-parse-service` + `elo-service` + `web`;
   - queue isolation should come from a separate Pulumi stack and Redis isolation from a separate `subdomain` value.

## Agreed Direction

The current plan is to proceed in phases:

1. Define the safety envelope and golden flows.
2. Standardize boot and validation commands.
3. Add deterministic smoke checks and artifacts.
4. Encode architectural rules and agent task protocol.
5. Add recurring cleanup and drift control.

For the broader platform/release problem, the current direction is:

1. treat current `sprocket` as the near-term customer-value lane,
2. force `v1.5` to prove it is a real runnable artifact,
3. treat `v2` and `v3` as gated slice-by-slice migration lanes rather than whole-platform launch candidates,
4. and use agents first for uncertainty-reduction work such as rehearsal, smoke testing, diffing, and risk tracking.

## Next Concrete Deliverables

1. `reports/agent-harness-charter.md`
2. Root harness scripts in `scripts/harness/`
3. Service manifest for local runtime metadata
4. First smoke flow targeting `core`
5. Artifact collection conventions and scripts
6. Release readiness scorecard across `v1`, `v1.5`, `v2`, and `v3`
7. Cutover risk register and lane comparison docs
8. Worktree-based bake-off across `main`, `v1.5`, and `dev`
9. Hosted environment contracts for `main` and `v1.5`
10. Shared release verification matrix
11. Beta rollout checklist for `v1.5`
12. Harness scripts under `scripts/harness/`
13. `v1.5` infra diff against `sprocket-infra`
14. Hosted `main` environment variable bundle for running Tier 0 against the real system
15. First `sprocket-infra` beta service definition for `monolith`

## Update Rule

Each future step should update this file with:

- what changed,
- what was learned,
- what was validated,
- what remains blocked or undecided,
- and the next recommended action.
