# Release Golden Flows

Updated: March 12, 2026

## Purpose

Define the shared customer/user journeys and smoke patterns that every serious release candidate must prove.

These flows are intended to be:

- implementation-agnostic enough to transfer from `main` to `v1.5`,
- concrete enough to automate,
- and narrow enough to run repeatedly.

## Flow Design Principles

1. Prefer high-value user journeys over low-value endpoint pings.
2. Cover one read path, one write path, and one side-effect path.
3. Validate both synchronous and asynchronous behavior.
4. Keep the first set small enough to automate quickly.

## Tier 0: Environment Smoke

This tier answers:

"Is the environment alive enough to test anything else?"

### T0.1 Ingress + Web Reachability

Expectation:

- web domain resolves,
- ingress routes to the correct service,
- homepage or login shell renders.

Evidence:

- HTTP status,
- HTML/title marker,
- screenshot if browser automation is used.

### T0.2 API Reachability

Expectation:

- API or GraphQL endpoint returns a healthy response.

Evidence:

- HTTP status,
- response body,
- response time.

### T0.3 Dependency Reachability

Expectation:

- app can reach required backing services:
  - Postgres
  - Redis
  - RabbitMQ
  - object storage

Evidence:

- service health output,
- app logs showing successful dependency connection,
- or explicit health/readiness response.

## Tier 1: Core Customer/User Journeys

These are the first CUJs to standardize and automate.

## CUJ 1: League Play Read Path

Source grounding:

- `reports/league-play-flow.md`

User intent:

- a user opens League Play, drills into a fixture, and sees actionable match/submission state.

Minimum path:

1. Open `/league`
2. Load season/schedule data
3. Open a fixture details page
4. Confirm match cards render
5. Confirm submission action state appears correctly:
   - completed,
   - ratifying,
   - or submit-ready

Pass criteria:

- schedule loads successfully,
- fixture details page renders expected match data,
- action state matches expected fixture data.

## CUJ 2: League Submission / Replay Evidence Path

Source grounding:

- `reports/league-play-flow.md`
- `scripts/test-replay-submission-flow.ts`

User intent:

- an authorized user uploads replay evidence and the submission advances through the expected workflow.

Minimum path:

1. Open submission page or create a test submission context
2. Trigger replay upload path
3. Observe parse/validation progression
4. Confirm submission status changes
5. Ratify if the submission becomes ratifiable

Pass criteria:

- upload path accepts the replay,
- submission state changes are observable,
- ratification path behaves correctly for an allowed user.

Notes:

- For early automation, mocking parse completion may be acceptable if the full parser path is too slow or brittle.
- That mocked path should be clearly labeled as partial coverage, not full evidence coverage.

## CUJ 3: Scrim Lifecycle

Source grounding:

- architecture intent in `reports/level3-architecture-intent.md`
- matchmaking/submission code surface

User intent:

- a scrim can be created, progress through a live state transition, and complete with durable evidence linkage.

Minimum path:

1. Create or join a scrim
2. Progress to active/in-progress state
3. Complete the scrim
4. Confirm submission linkage exists
5. Confirm resulting state is queryable

Pass criteria:

- scrim state transitions are valid,
- no conflicting participation state occurs,
- completion path produces durable downstream state.

## Tier 2: Side-Effect Flows

These are not the first automation targets, but they should be added before any serious promotion.

## CUJ 4: Notification Emission

Expectation:

- a high-value domain transition results in the expected notification or notification intent.

Pass criteria:

- the notification path fires once,
- targeting is correct,
- no obvious duplicate processing occurs.

## CUJ 5: Report Card / Image Generation

Expectation:

- the image generation/report card path can be triggered from a trusted domain event and results in a retrievable artifact.

Pass criteria:

- job accepted,
- artifact generated,
- artifact stored in expected location.

## CUJ 6: Replay Parse Side-Effects

Expectation:

- replay ingestion produces parse results and downstream state without hanging or double-processing.

Pass criteria:

- parse job accepted,
- progress/result observable,
- final state consistent with expected outcome.

## Transferability Rule

The first automation effort should make Tier 0 and Tier 1 flows transferable between:

- `main`
- `v1.5`

This means the flow spec should describe:

- user/system preconditions,
- commands or API actions,
- expected visible results,
- expected logs/artifacts,
- and known branch-specific adaptation points.

## Initial Automation Sequence

1. Automate T0.2 API Reachability for `main`.
2. Automate CUJ 1 for `main`.
3. Automate CUJ 2 for `main`.
4. Automate CUJ 3 for `main`.
5. Port the exact same checks to `v1.5`.

## Output Requirements for Every Automated Flow

Each run should record:

- environment name,
- branch/ref,
- timestamp,
- commands executed,
- HTTP or GraphQL responses,
- relevant logs,
- final pass/fail,
- and short failure summary.

## Minimum Success Definition

We can say the smoke patterns are established when:

1. Tier 0 and Tier 1 are written down,
2. `main` can pass them repeatedly,
3. `v1.5` can run the same flow set with only documented branch-specific adjustments,
4. and every run leaves artifacts behind.
