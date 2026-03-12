# Sprocket Agent Harness Roadmap

Updated: March 12, 2026

## Purpose

This roadmap turns the high-level "harness engineering" strategy into a concrete execution plan for Sprocket.

The goal is not full autonomy immediately. The goal is to make the repository progressively more legible, testable, and governable so an agent can safely execute a larger percentage of routine development work.

## Current Repo Reality

Sprocket already has several useful building blocks:

- a workspace root with shared scripts in [`package.json`](../package.json),
- a local multi-service stack in [`docker-compose.yml`](../docker-compose.yml),
- local setup documentation in [`LOCAL_DEVELOPMENT.md`](../LOCAL_DEVELOPMENT.md),
- a core NestJS HTTP + RMQ entrypoint in [`core/src/main.ts`](../core/src/main.ts),
- multiple RMQ-backed Nest microservices,
- a web client and image-generation frontend,
- partial unit/integration coverage across several services,
- a pre-existing `apps/monolith` area that may become useful later.

What is missing is an explicit agent-facing harness:

- one-command environment boot,
- deterministic fixtures,
- shared artifact collection,
- system smoke tests,
- machine-checkable architectural rules,
- and a repeatable agent execution protocol.

## North Star

The first practical target state is:

An agent can take a bounded task affecting `core`, `clients/web`, `microservices/submission-service`, or `microservices/matchmaking-service`, boot the minimum required local stack, validate baseline behavior, make a code change, run targeted tests and smoke checks, collect evidence, and return a reviewable summary with clear escalation if risk exceeds policy.

## Program Structure

This should be executed in seven phases. Each phase should leave the repo in a better operational state even if later phases are delayed.

## Phase 0: Charter and Safety Envelope

### Objective

Define what the agent may do, what it must prove, and what remains human-owned.

### Deliverables

1. Create a short harness charter doc.
2. Define task classes:
   - safe autonomous,
   - autonomous with review,
   - human-owned.
3. Define escalation boundaries.
4. Define the first three golden flows to automate.

### Proposed Files

- `reports/agent-harness-charter.md`
- `reports/agent-harness-progress.md`

### Required Decisions

1. In scope for v1:
   - `core`
   - `clients/web`
   - `microservices/submission-service`
   - `microservices/matchmaking-service`
2. Out of scope for autonomous changes in v1:
   - production infra,
   - secrets,
   - Discord bot behavior that reaches real guilds/users,
   - schema-breaking DB migrations without review,
   - broad cross-service contract redesigns.
3. Required proof for v1 tasks:
   - targeted unit tests where applicable,
   - at least one smoke or integration proof,
   - artifact capture on failure.

### Exit Criteria

- Every incoming task can be categorized before coding begins.
- There is written policy for when the agent must stop and escalate.

## Phase 1: Standardize the Agent Entry Surface

### Objective

Remove environment ambiguity. An agent should not need to infer how to boot the stack or discover which services are required.

### Deliverables

1. Add root-level commands for environment lifecycle.
2. Create a machine-readable service manifest.
3. Normalize readiness checks and ports.
4. Publish a single "how the repo boots" document for both humans and agents.

### Proposed Files and Changes

- Update [`package.json`](../package.json) with root scripts:
  - `dev:up`
  - `dev:down`
  - `dev:reset`
  - `dev:status`
  - `dev:logs`
  - `dev:smoke`
  - `test:changed`
  - `lint:changed`
- Add `scripts/harness/dev-up.sh`
- Add `scripts/harness/dev-down.sh`
- Add `scripts/harness/dev-reset.sh`
- Add `scripts/harness/dev-status.sh`
- Add `scripts/harness/dev-logs.sh`
- Add `scripts/harness/service-manifest.json`
- Add `reports/agent-harness-local-runtime.md`

### Service Manifest Shape

The service manifest should minimally define:

- service name,
- workspace path,
- start command,
- health/readiness probe,
- port,
- depends-on services,
- required infrastructure,
- whether the service is safe for autonomous boot in local dev.

### Recommended Initial Manifest Entries

- `core`
- `web`
- `submission-service`
- `matchmaking-service`
- infra dependencies:
  - `postgres`
  - `redis`
  - `rabbitmq`
  - `minio`

### Exit Criteria

- A fresh checkout can be booted with one root command.
- An agent can determine the minimum required services from the manifest instead of searching the repo.

## Phase 2: Deterministic Validation and Fixtures

### Objective

Give the agent cheap, repeatable proof loops.

### Deliverables

1. Add deterministic local seed/reset flow.
2. Add smoke tests that run against the local stack.
3. Define golden fixtures for at least three end-to-end paths.
4. Make failures produce concise diagnostic output.

### Golden Flows for V1

1. Core GraphQL health and a representative authenticated query/mutation.
2. Submission-service replay intake or validation path.
3. Matchmaking-service scrim queue/state transition path.

### Proposed Files and Changes

- Add `scripts/harness/smoke.sh`
- Add `scripts/harness/seed.sh`
- Add `scripts/harness/reset-data.sh`
- Add `scripts/harness/graphql-smoke.ts`
- Add `scripts/harness/submission-smoke.ts`
- Add `scripts/harness/matchmaking-smoke.ts`
- Add `scripts/test-data/agent-harness/` fixtures
- Add `reports/agent-harness-golden-flows.md`

### Notes

The purpose of these flows is not broad product coverage. The purpose is to give the agent:

- a baseline environment check,
- one meaningful system proof per major capability,
- and a way to tell whether a change broke the system.

### Exit Criteria

- `npm run dev:smoke` can validate the local stack with deterministic output.
- Failures identify the specific broken flow.

## Phase 3: Artifact Capture and Runtime Legibility

### Objective

Make debugging first-class. Agents need direct evidence, not only command exit codes.

### Deliverables

1. Standard artifact directory structure.
2. Structured log capture for relevant services.
3. Correlation IDs for smoke/test runs where practical.
4. Failure bundles that can be reviewed by humans.

### Proposed Files and Changes

- Add `artifacts/.gitkeep`
- Add `scripts/harness/collect-artifacts.sh`
- Add `scripts/harness/tail-service-logs.sh`
- Add `scripts/harness/failure-summary.ts`
- Add `reports/agent-harness-artifacts.md`

### Recommended Artifact Layout

```text
artifacts/
  latest/
    metadata.json
    smoke/
    logs/
    screenshots/
    graphql/
    summaries/
```

### Minimum Evidence for a Failed Task

- commands run,
- services started,
- failing test/smoke output,
- relevant service logs,
- screenshots if UI involved,
- short machine-generated failure summary.

### Exit Criteria

- An agent can answer "what failed?" and "what evidence supports that?" from local artifacts alone.

## Phase 4: Architectural Rules and Agent Instructions

### Objective

Constrain behavior so speed does not become architectural drift.

### Deliverables

1. Add repo-level agent instructions.
2. Add service-local instructions where behavior differs.
3. Encode dependency and boundary rules in lint or CI where possible.
4. Add a standard task template requiring proof expectations.

### Proposed Files and Changes

- Add `AGENTS.md` at repo root if missing
- Add service-local docs where useful:
  - `core/AGENTS.md`
  - `clients/web/AGENTS.md`
  - `microservices/submission-service/AGENTS.md`
  - `microservices/matchmaking-service/AGENTS.md`
- Add `reports/agent-task-template.md`
- Add `reports/agent-architecture-rules.md`

### Rules to Encode Early

1. Business logic placement:
   - domain logic stays in the owning service/module,
   - UI does not become the source of truth for policy.
2. Cross-service changes:
   - require explicit note of affected contracts and validation proof.
3. Configuration handling:
   - no secret material checked into repo,
   - use existing config resolution patterns from `common`.
4. Validation requirements:
   - any non-trivial behavioral change must specify proof.

### Exit Criteria

- The agent has explicit local instructions instead of inferring repo norms from inconsistent examples.

## Phase 5: Agent Task Protocol

### Objective

Standardize how autonomous work happens so tasks become reproducible and comparable.

### Deliverables

1. Create a default execution protocol for bounded tasks.
2. Create a self-review checklist.
3. Require structured output for completed tasks.

### Default Task Protocol

1. Read task and identify affected services.
2. Read relevant local instructions.
3. Boot minimal required infra and services.
4. Validate baseline.
5. Reproduce the issue or confirm the target gap.
6. Implement the change.
7. Run targeted tests.
8. Run relevant smoke flow.
9. Collect artifacts.
10. Perform self-review.
11. Produce a concise summary with residual risks.

### Proposed Files and Changes

- Add `reports/agent-task-protocol.md`
- Add `reports/agent-self-review-checklist.md`
- Add `scripts/harness/task-runner.sh`

### Exit Criteria

- The task protocol can be followed consistently by different agents without substantial prompt variance.

## Phase 6: UI Automation for the Web Client

### Objective

Allow the agent to validate more than backend-only changes.

### Deliverables

1. Add browser-based smoke coverage for the web client.
2. Capture screenshots on failure.
3. Create one or two user-facing golden journeys.

### Recommended Initial UI Journeys

1. Load web app and authenticate against a local/test path if available.
2. Navigate to one high-value page and verify the expected data shell renders.
3. Trigger one safe end-to-end action and verify UI state converges.

### Proposed Files and Changes

- Add `clients/web/playwright.config.ts`
- Add `clients/web/tests/smoke/`
- Add `scripts/harness/web-smoke.sh`
- Update root scripts to include optional UI smoke stage

### Exit Criteria

- The agent can prove a UI-facing change with screenshots and browser assertions instead of relying on "page loads for me".

## Phase 7: Recurring Cleanup and Drift Control

### Objective

Treat cleanup as part of the harness, not an occasional manual project.

### Deliverables

1. Add recurring checks for drift and stale patterns.
2. Add recurring smoke runs.
3. Add periodic architecture review tasks that write back into `reports/`.

### Suggested Automation Jobs

1. Weekly smoke validation of golden flows.
2. Weekly drift scan:
   - dead scripts,
   - duplicate helpers,
   - stale docs,
   - failing lint or type checks,
   - flaky tests.
3. Monthly architecture drift review against the level docs in `reports/`.

### Proposed Files and Changes

- Add `reports/agent-drift-checklist.md`
- Add `reports/agent-maintenance-rhythm.md`
- Optionally add automations later once the workflow stabilizes

### Exit Criteria

- Quality cleanup becomes continuous instead of reactive.

## Monolith Decision Gate

The repo already contains `apps/monolith`, but the harness should not depend on it initially.

Use the current multi-service stack first. Only invest further in a monolith/dev aggregation path if:

- local boot remains too slow,
- smoke tests remain too brittle across service boundaries,
- or the agent repeatedly loses time on multi-process orchestration.

Decision rule:

- If Phases 1 through 4 succeed with the current stack, keep the harness multi-service.
- If not, prototype a faster monolith-backed validation harness strictly for local agent execution.

## Suggested 90-Day Sequence

### Weeks 1-2

- Complete Phase 0.
- Start Phase 1.
- Add progress logging discipline.

### Weeks 3-4

- Finish Phase 1.
- Implement seed/reset and first GraphQL smoke path from Phase 2.

### Weeks 5-6

- Add submission and matchmaking smoke flows.
- Introduce artifact collection.

### Weeks 7-8

- Add repo and service-level agent instructions.
- Encode initial architecture and proof rules.

### Weeks 9-10

- Implement the standard task protocol.
- Add self-review and structured handoff.

### Weeks 11-12

- Add first UI smoke journey.
- Start recurring drift and smoke maintenance.
- Reassess whether monolith support is justified.

## Recommended First Milestone

The first milestone should be intentionally small but end-to-end:

1. Add root harness scripts.
2. Add service manifest.
3. Add deterministic local seed/reset.
4. Add one GraphQL smoke flow.
5. Add artifact collection for failures.

That would create the first real agent harness slice without requiring major architectural change.

## Success Metrics

Track these from the start:

1. Time from fresh checkout to passing smoke.
2. Time from task start to reproducible failure.
3. Percentage of agent tasks completed without environment-related human intervention.
4. Percentage of tasks with artifact-backed proof.
5. Smoke test flake rate.
6. Number of escalations caused by ambiguity versus technical blockage.

## Immediate Next Steps

1. Write the Phase 0 charter.
2. Inventory the exact local services and dependencies required for the first golden flow.
3. Add the root harness script skeletons.
4. Implement the first smoke path against `core`.
5. Add the progress log update process so each planning and implementation step is preserved locally.
