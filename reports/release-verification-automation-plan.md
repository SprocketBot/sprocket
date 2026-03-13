# Release Verification Automation Plan

Updated: March 12, 2026

## Goal

Create a deployment and verification strategy that allows:

1. `main` to remain the production truth,
2. `v1.5` to be deployed safely,
3. real user traffic to reach `v1.5` with bounded blast radius,
4. and shared smoke/CUJ automation to be established before application-code changes.

## Current Answer

Yes, we have established the first shared smoke/CUJ catalogue for `main` and `v1.5`.

That work now exists in:

- `reports/variant-hosting-strategy.md`
- `reports/release-golden-flows.md`
- `reports/league-play-flow.md`

But the current state is still:

- documented at the flow/spec level,
- not yet automated,
- and not yet tied to a hosted-environment verification harness.

## Operating Model

## Production Lane

`main` stays exactly where customer trust lives:

- current infra,
- current production queues,
- current production database,
- current production side-effect path.

No early `v1.5` rollout should share that async processing path.

## Beta Lane

`v1.5` should be hosted as a separate beta environment with:

1. separate hostname,
2. separate Pulumi stack or equivalent environment boundary,
3. separate queue namespace,
4. separate Redis namespace/prefix,
5. separate database or schema target,
6. separate object-storage prefix/bucket policy,
7. separate dashboards, logs, and smoke artifacts.

This is how we get "real traffic" without turning `main` into a migration experiment.

## Real Traffic Definition

For `v1.5`, real traffic should mean:

- invited internal users first,
- then one low-risk beta cohort,
- then a bounded production-like slice.

It should not mean:

- live production traffic splitting on the same backend state,
- or both variants consuming the same async workload at the same time.

## Shared Verification Baseline

The first transferable verification baseline is:

## Tier 0: Environment Smoke

1. ingress and web shell are reachable,
2. API/GraphQL is reachable,
3. dependencies are connected,
4. environment identity is correct.

## Tier 1: Core CUJs

1. League Play Read Path
2. League Submission / Replay Evidence Path
3. Scrim Lifecycle

## Tier 2: Side-Effect Checks

1. notification emission,
2. replay-parse side effects,
3. report-card / image-generation path.

The first automation milestone should cover Tier 0 plus Tier 1.

## What Must Be Automated Before App Changes

## 1. Environment Contract

For each hosted lane, define a machine-readable contract that records:

- variant name,
- git ref,
- hostname,
- API endpoint,
- GraphQL endpoint,
- expected service topology,
- queue namespace,
- Redis prefix,
- DB target,
- storage target,
- and log/artifact locations.

Suggested output:

- `reports/release-environment-contracts.md`
- `reports/release-verification-matrix.md`

## 2. Verification Matrix

For both `main` and `v1.5`, record for each flow:

- preconditions,
- actor identity,
- test data source,
- exact command/script,
- expected result,
- failure evidence,
- and branch-specific adaptation notes.

This is the bridge between "documented flow" and "repeatable smoke."

## 3. Artifact Convention

Every run should leave behind:

- timestamp,
- environment name,
- branch/ref,
- commands run,
- HTTP/GraphQL responses,
- screenshots where relevant,
- service logs,
- final pass/fail,
- short operator summary.

Suggested location:

- `artifacts/release-validation/<environment>/<timestamp>/...`

## 4. Non-App-Code Automation

Before touching product logic, add only harness-layer automation:

1. Tier 0 HTTP/API reachability checks
2. browser or route-level check for League Play load
3. script-backed replay-submission flow check
4. scrim lifecycle smoke
5. artifact bundling

This should live outside product logic, ideally under:

- `scripts/harness/`

## 5. Promotion Gates

Define explicit gates:

### Gate A: Hostable

`v1.5` can be deployed into an isolated beta environment.

### Gate B: Smokable

Tier 0 and Tier 1 automation pass repeatedly on `main`.

### Gate C: Transferable

The same automated checks run against `v1.5` with only documented adaptation points.

### Gate D: Beta-Ready

`v1.5` can serve invited users without operational instability.

### Gate E: Cutover-Candidate

`v1.5` survives real beta usage and has a written rollback plan.

## Concrete Execution Sequence

1. Freeze the strategy documents and treat them as the pre-code source of truth.
2. Define the hosted environment contract for `main`.
3. Define the hosted environment contract required for `v1.5`.
4. Write the shared verification matrix for Tier 0 and Tier 1.
5. Implement the harness scripts against `main` first.
6. Run them against the current hosted `main` environment until they are stable.
7. Map `v1.5` onto `sprocket-infra` as a separate beta stack.
8. Deploy `v1.5` into that isolated stack.
9. Run the exact same verification matrix against `v1.5`.
10. Start internal-only traffic.
11. Expand to invite-only beta traffic.
12. Only after this, evaluate cutover mechanics or product-code changes.

## Near-Term Deliverables

The next concrete markdown deliverables should be:

1. `reports/release-environment-contracts.md`
2. `reports/release-verification-matrix.md`
3. `reports/v15-beta-rollout-checklist.md`

The next concrete automation deliverables should be:

1. `scripts/harness/check-web.sh`
2. `scripts/harness/check-api.sh`
3. `scripts/harness/run-league-read-smoke.ts`
4. `scripts/harness/run-replay-submission-smoke.ts`
5. `scripts/harness/run-scrim-lifecycle-smoke.ts`
6. `scripts/harness/collect-artifacts.sh`

## Recommendation

The shortest path to customer value is:

1. keep `main` untouched operationally,
2. automate Tier 0 and Tier 1 against hosted `main`,
3. stand up `v1.5` as an isolated beta environment,
4. then move real but bounded traffic onto `v1.5`.

That sequence reduces uncertainty in the order that matters most:

- first verification,
- then hostability,
- then traffic,
- then migration.
