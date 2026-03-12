# `v1.5` Beta Rollout Checklist

Updated: March 12, 2026

## Purpose

Provide the minimum checklist required to bring `v1.5` up as an isolated beta environment and start sending bounded real traffic to it.

This checklist is intentionally verification-first and does not assume application-code changes.

## Phase 0: Define the Beta Boundary

- Confirm the `v1.5` source ref remains `personal/gankoji/unbork-cloud-spend`.
- Choose the beta environment name: `beta` or `v15`.
- Choose the public hostname pattern for web and API.
- Decide whether beta runs on a separate node or a separate stack on the existing node.
- Write down the rollback rule: `main` remains the only production truth during beta.

## Phase 1: Infra Mapping

- Map the current `main` service topology in `sprocket-infra`.
- Define the intended `v1.5` topology:
  - `monolith`
  - `replay-parse-service`
  - any required frontend surface
- Identify every config input currently expected by `core` and the microservices that now moves into `monolith`.
- Define separate queue naming or namespace strategy for beta.
- Define separate Redis key prefix strategy for beta.
- Define separate database or schema target for beta.
- Define separate storage bucket or prefix strategy for beta.
- Define separate dashboards/log filters for beta.

## Phase 2: Data and Identity

- Decide whether beta uses sanitized copied data or synthetic data.
- Choose the internal operator accounts for smoke and staff testing.
- Choose the first beta cohort:
  - internal only,
  - then one trusted org or league.
- Write down exactly which roles and permissions those testers need.

## Phase 3: Verification Readiness

- Finalize `reports/release-environment-contracts.md`.
- Finalize `reports/release-verification-matrix.md`.
- Confirm Tier 0 and Tier 1 smoke definitions are stable.
- Identify the canonical fixture/scrim/test data references for hosted checks.
- Define artifact storage for every hosted verification run.

## Phase 4: Harness-Only Automation

- Implement `scripts/harness/check-api.sh`.
- Implement `scripts/harness/check-web.sh`.
- Implement `scripts/harness/check-dependencies.sh`.
- Implement `scripts/harness/run-league-read-smoke.ts`.
- Implement `scripts/harness/run-replay-submission-smoke.ts`.
- Implement `scripts/harness/run-scrim-lifecycle-smoke.ts`.
- Implement `scripts/harness/collect-artifacts.sh`.
- Stabilize those checks against hosted `main`.

## Phase 5: Beta Deployment

- Create the beta stack/config in `sprocket-infra`.
- Deploy the beta backing services and application topology.
- Verify ingress, TLS, and service health.
- Run Tier 0 smoke.
- Fix deployment/config issues until Tier 0 is stable.
- Run Tier 1 smoke.
- Do not invite any humans until Tier 1 passes consistently.

## Phase 6: Internal Traffic

- Grant access only to internal operators first.
- Run the League Play read path manually and via automation.
- Run replay submission manually and via automation.
- Run scrim lifecycle manually and via automation.
- Capture every failure with artifacts and branch it into:
  - infra/config defect,
  - observability gap,
  - product defect.

## Phase 7: Invite-Only Beta

- Select one low-risk customer cohort.
- State what workflows they are expected to use.
- State what workflows are explicitly out of scope.
- Add a monitoring cadence for the beta period.
- Require smoke to pass before each beta deployment.
- Require rollback to `main` for any significant reliability regression.

## Exit Criteria

`v1.5` is a serious cutover candidate only when:

1. it is hostable in an isolated lane,
2. Tier 0 and Tier 1 pass repeatedly,
3. internal users can use it without operational confusion,
4. a beta cohort has exercised it successfully,
5. rollback is rehearsed and documented.

## Current Blockers

As of March 12, 2026, the main blockers are:

1. `v1.5` does not yet have an explicit infra mapping in `sprocket-infra`,
2. the shared smoke/CUJ catalogue is documented but not automated,
3. hosted environment identities and test accounts are not yet pinned down.
