# Variant Hosting Strategy

Updated: March 12, 2026

## Goal

Work with multiple platform variants without breaking the current production line.

Specifically:

1. keep `main` (`v1`) running as-is,
2. get `v1.5` deployed in a real hosted environment,
3. send some meaningful traffic to `v1.5`,
4. and avoid changing application code until the deployment and verification model is documented and automated.

## The Key Constraint

`v1` and `v1.5` are not just two web frontends.

They both include:

- API behavior,
- RabbitMQ consumers,
- background workflows,
- replay/submission processing,
- notification side effects,
- Redis-backed state,
- and DB writes.

That means we should **not** put `v1.5` on the same live queues and side-effect path as `v1` during early validation.

If both stacks consume the same production queues at once, likely failure modes include:

- duplicated notifications,
- replay/submission workflows processing twice,
- competing writes,
- unexpected state transitions,
- and hard-to-debug race conditions.

## Strategic Conclusion

The first `v1.5` traffic should **not** be "transparent canary traffic against the exact same production backend."

The first `v1.5` traffic should be:

- a parallel hosted environment,
- with separate environment identity,
- separate queue namespace,
- separate Redis namespace,
- separate database/schema,
- separate object storage buckets,
- and a distinct subdomain.

That gives real traffic with bounded blast radius.

## Recommended Rollout Shape

## Lane A: `main` stays stable on current production infra

`main` remains:

- the source of truth,
- the only stack using current production queue consumers,
- and the system responsible for normal customer traffic.

No change to this assumption until `v1.5` proves itself.

## Lane B: `v1.5` gets a parallel beta environment

`v1.5` should be deployed as a new environment, not as an in-place replacement.

Recommended naming:

- subdomain: `beta.sprocket...` or `v15.sprocket...`
- Pulumi stack: `beta` or `v15`
- isolated environment prefix for transport queues and secrets

### Preferred Hosting Option

Use a separate droplet/node if budget allows.

Why:

- protects `main` from CPU/RAM contention,
- avoids shared-node incident coupling,
- makes rollback trivial,
- makes resource comparison clearer.

### Cheaper but Riskier Option

Use the same Swarm host with a separate stack/environment namespace.

Only do this if:

- capacity is verified,
- resource limits are explicit,
- and you accept that a bad `v1.5` deployment could still hurt `main`.

## Traffic Strategy

## Stage 0: No-user bake-off

Deploy `v1.5` to its own environment with:

- production-shaped infra,
- cloned/sanitized data,
- full smoke automation,
- no public user access.

Goal:

Prove that `v1.5` is hostable and operationally sane.

## Stage 1: Internal traffic only

Expose `v1.5` to:

- you,
- trusted staff,
- and maybe one or two ops-heavy internal users.

Goal:

Verify deployability, browsing, submission workflows, and ops ergonomics with real humans.

## Stage 2: Invite-only beta traffic

Expose `v1.5` to:

- one low-risk league,
- one trusted org,
- or a narrow operator workflow.

Important:

This should still be a distinct environment, not shared live production traffic.

Goal:

Get real usage patterns without putting the whole platform on the line.

## Stage 3: Cutover rehearsal

Only after Stage 2 succeeds:

- rehearse an actual cutover,
- document rollback,
- and verify smoke post-deploy on the production path.

## What "Some Real Traffic" Should Mean

For `v1.5`, early "real traffic" should mean:

- actual humans using the beta environment,
- actual user journeys executed end to end,
- but within an isolated environment contract.

It should **not** mean:

- production main domain traffic being split between `v1` and `v1.5`,
- or both variants processing the same asynchronous production workload concurrently.

## Environment Model

The minimum safe parallel-environment model for `v1.5` is:

1. distinct hostname/subdomain,
2. distinct queue namespace,
3. distinct Redis prefix,
4. distinct database target,
5. distinct object storage buckets or prefixes,
6. separate verification script,
7. separate dashboards/log queries,
8. explicit operator statement of what data is shared vs isolated.

## CUJ and Smoke Model

Before any code changes, we should establish shared verification at three levels.

## Tier 0: Deployment Smoke

This proves the environment is alive.

Checks:

1. DNS and ingress resolve correctly.
2. TLS works or is intentionally bypassed in test.
3. All required service replicas/processes are up.
4. Core API responds.
5. Web app loads.
6. Background dependencies are reachable:
   - Postgres
   - Redis
   - RabbitMQ
   - object storage

## Tier 1: Core CUJ Smoke

These are the minimum customer/user journeys that must pass on both `main` and `v1.5`.

1. League Play Read
   - Load league schedule
   - Open a fixture
   - Confirm matches and submission actions render correctly

2. League Submission Flow
   - Open a submission
   - Upload replay(s) or simulate the upload path
   - Confirm submission status transitions correctly
   - Ratify results if allowed

3. Scrim Lifecycle
   - Create/join a scrim
   - Progress the scrim into active state
   - Complete it and confirm submission linkage

## Tier 2: Side-Effect Smoke

These verify non-UI but user-visible platform behaviors.

1. Notification path fires when expected.
2. Replay parse path produces expected status/result state.
3. Image/report-card generation path is reachable when triggered.
4. Background queues drain without obvious stuck jobs or duplicate processing.

## Required CUJ Rule

Any `v1.5` deployment must pass the same Tier 0 and Tier 1 flows that `main` passes.

That is the minimum bar for transferability.

## Automation Plan

We should automate these in order.

## Automation 1: Shared CUJ Spec

Write one source-of-truth doc that names:

- the CUJs,
- their preconditions,
- the actions taken,
- and the expected outcomes.

## Automation 2: Environment Verification Scripts

One script per environment:

- `verify-main`
- `verify-v15`

Each script should run Tier 0 first, then Tier 1 smoke.

## Automation 3: Artifact Capture

Each verification run should output:

- timestamps,
- branch/stack metadata,
- commands run,
- logs,
- responses,
- screenshots if applicable,
- and a final pass/fail summary.

## Automation 4: Promotion Gates

Promotions should be blocked unless:

1. deploy smoke passes,
2. core CUJs pass,
3. artifact bundle exists,
4. rollback steps are current,
5. and side-effect checks do not show duplicate processing or broken queue behavior.

## Practical Next Step Order

1. Document the shared CUJs and smoke tiers.
2. Automate Tier 0 checks for `main`.
3. Automate Tier 1 checks for `main`.
4. Port the same checks to `v1.5`.
5. Create a hosted `v1.5` beta environment with isolated infra.
6. Only then invite real users.

## Decision Rule

If the question is:

"How do we keep `main` running, get `v1.5` deployed, and get real traffic to it?"

The answer is:

- keep `main` on the current production infra untouched,
- host `v1.5` in a separate beta environment,
- use shared CUJ/smoke automation as the admission gate,
- and let real users into `v1.5` only through that parallel beta environment first.
