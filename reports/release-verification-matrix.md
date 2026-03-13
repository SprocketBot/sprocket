# Release Verification Matrix

Updated: March 12, 2026

## Purpose

Turn the release smoke/CUJ strategy into a repeatable matrix that can be executed against:

- `main` production,
- `v1.5` beta,
- and later any additional candidate lane.

This document is the operational bridge between the high-level flow definitions and the actual harness scripts.

## Run Output Requirements

Every verification run must record:

1. environment name,
2. branch/ref,
3. timestamp,
4. operator or automation identity,
5. commands executed,
6. endpoints touched,
7. artifacts collected,
8. pass/fail result,
9. short failure summary.

Suggested artifact path:

- `artifacts/release-validation/<environment>/<timestamp>/`

## Matrix Columns

Each flow below defines:

- objective,
- preconditions,
- execution shape,
- expected evidence,
- automation target,
- and branch adaptation notes.

## Tier 0: Environment Smoke

## T0.1 Web Reachability

### Objective

Prove the user-facing web surface is reachable through the intended ingress path.

### Preconditions

- environment deployed
- DNS configured
- ingress healthy

### Execution

1. request the web root or login shell
2. confirm expected HTTP response
3. confirm expected HTML/title marker
4. capture screenshot if browser automation is used

### Evidence

- response status
- final URL
- title or content marker
- screenshot

### Automation Target

- `scripts/harness/check-web.sh`

### Branch Notes

`main` and `v1.5` should both satisfy this check, even if the backing topology differs.

## T0.2 API Reachability

### Objective

Prove the API/GraphQL endpoint is alive enough to support higher-value flows.

### Preconditions

- API ingress deployed
- core or monolith process healthy

### Execution

1. send a health-style request or GraphQL introspection/lightweight query
2. measure status and latency
3. record response body

### Evidence

- HTTP status
- response body
- latency

### Automation Target

- `scripts/harness/check-api.sh`

### Branch Notes

For `main`, this targets `core`.

For `v1.5`, this targets `monolith`.

## T0.3 Dependency Reachability

### Objective

Prove the app can reach the services required to execute customer workflows.

### Preconditions

- workload processes started
- dependency services started

### Execution

1. inspect service health or readiness endpoints if available
2. inspect app logs for successful dependency connection
3. fail if critical dependencies are unavailable

### Evidence

- service health output
- app log markers
- dependency connection markers

### Automation Target

- `scripts/harness/check-dependencies.sh`

### Branch Notes

Critical dependencies currently include:

- Postgres
- Redis
- RabbitMQ
- object storage

## Tier 1: Core Customer/User Journeys

## T1.1 League Play Read Path

### Objective

Prove a real user can reach League Play and inspect fixture state.

### Preconditions

- seeded or production-like data exists
- actor has valid organization context
- at least one known fixture is available

### Execution

1. authenticate as a valid user
2. open `/league`
3. load season or schedule data
4. open a known fixture
5. confirm match cards and submission state render

### Evidence

- browser trace or screenshot
- GraphQL responses for schedule and fixture
- final rendered state markers

### Automation Target

- `scripts/harness/run-league-read-smoke.ts`

### Source Grounding

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/reports/league-play-flow.md`

### Branch Notes

The flow definition is intended to transfer unchanged. Only endpoint URLs and fixture/test-data handles should vary.

## T1.2 Replay Submission Flow

### Objective

Prove replay evidence can be submitted and the workflow advances.

### Preconditions

- valid user exists
- user can create or access a valid submission context
- replay upload path is enabled

### Execution

1. authenticate
2. create or obtain a submission context
3. upload replay evidence
4. observe parsing/validation progression
5. confirm status moves beyond the initial upload state

### Evidence

- GraphQL mutation responses
- uploaded filenames
- submission status before and after
- relevant service logs

### Automation Target

- `scripts/harness/run-replay-submission-smoke.ts`

### Existing Starting Point

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/scripts/test-replay-submission-flow.ts`

### Branch Notes

Early automation may use a mocked parser-completion path if the full parse path is too slow or brittle, but that must be recorded as partial coverage.

## T1.3 Scrim Lifecycle

### Objective

Prove a scrim can be created, progress, complete, and remain queryable.

### Preconditions

- valid user exists
- required game mode and skill group data exist
- downstream submission linkage is enabled

### Execution

1. authenticate
2. create or join a scrim
3. transition it into active state
4. complete it
5. verify resulting submission linkage and queryable final state

### Evidence

- create/join mutation output
- state transition records
- final query result
- relevant logs

### Automation Target

- `scripts/harness/run-scrim-lifecycle-smoke.ts`

### Branch Notes

For Rocket League on hosted `main`, the live mode inventory now implies a multi-actor harness:

- Doubles requires `4` actors
- Standard requires `6` actors

The current two-actor scrim harness is therefore insufficient for a full Rocket League promotion gate. See:

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/reports/four-actor-scrim-harness-design.md`

This is the most likely flow to expose divergence between the multi-service and monolith topologies.

## Tier 2: Side-Effect Checks

## T2.1 Notification Emission

### Objective

Confirm high-value transitions emit the expected notification intent exactly once.

### Preconditions

- notification path enabled
- known trigger event available

### Automation Target

- deferred until Tier 0 and Tier 1 are stable

## T2.2 Replay Parse Side-Effects

### Objective

Confirm replay ingestion creates downstream state without duplicate processing.

### Preconditions

- replay parser enabled
- traceable test submission available

### Automation Target

- deferred until Tier 0 and Tier 1 are stable

## T2.3 Report Card / Image Generation

### Objective

Confirm a trusted domain event can create a retrievable artifact.

### Preconditions

- image-generation path enabled
- object storage reachable

### Automation Target

- deferred until Tier 0 and Tier 1 are stable

## Execution Order

The matrix should be operationalized in this order:

1. T0.2 API Reachability on hosted `main`
2. T0.1 Web Reachability on hosted `main`
3. T0.3 Dependency Reachability on hosted `main`
4. T1.1 League Play Read Path on hosted `main`
5. T1.2 Replay Submission Flow on hosted `main`
6. T1.3 Scrim Lifecycle on hosted `main`
7. repeat the same six checks against hosted `v1.5`

## Success Definition

The shared smoke baseline is established when:

1. Tier 0 and Tier 1 can run against hosted `main`,
2. the results are artifact-backed,
3. the same checks can run against hosted `v1.5`,
4. all branch-specific differences are documented rather than implied.

## Current Implementation Status

As of March 12, 2026:

1. Tier 0 is implemented and has been run successfully against hosted `main`.
2. Tier 1 automation entrypoints now exist for:
   - League Read
   - Scrim Lifecycle
   - Replay Submission
3. Tier 1 has not yet been fully executed against hosted `main` in this workspace because the production-safe actor tokens, impersonation IDs, and replay fixtures were not supplied.

## Open Decisions

The following still need explicit answers before automation wiring begins:

1. what account identities will be used for hosted smoke,
2. what data fixtures will be treated as canonical,
3. whether League and Scrim smoke should be browser-driven, API-driven, or hybrid,
4. where artifacts from hosted runs will be stored and retained,
5. whether the first harness execution target is local rehearsal, hosted `main`, or both in parallel.
