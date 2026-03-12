# Release Environment Contracts

Updated: March 12, 2026

## Purpose

Define the hosted-environment contract for the current production lane and the intended `v1.5` beta lane.

This document is meant to answer:

- what each environment is allowed to do,
- what infrastructure identity it uses,
- what service topology it runs,
- and what must remain isolated.

## Contract Rules

Every release environment must define:

1. environment name,
2. source branch/ref,
3. user-facing hostname(s),
4. API hostname(s),
5. service topology,
6. queue namespace,
7. Redis namespace/prefix,
8. database target,
9. object-storage target,
10. observability/log destination,
11. verification commands,
12. promotion boundaries.

## Environment A: `main` Production

### Purpose

Serve normal customer traffic and remain the only production source of truth until a replacement proves itself.

### Source of Truth

- Branch: `main`
- Worktree: `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main`
- Infra repo: `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra`

### Observed Hosting Model

Backed by Pulumi + Docker Swarm in `sprocket-infra`.

Observed platform topology from `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/platform/src/Platform.ts`:

- `web`
- `core`
- `discord-bot`
- `image-generation-frontend`
- `image-generation-service`
- `matchmaking-service`
- `notification-service`
- `server-analytics-service`
- `submission-service`
- `replay-parse-service`

### External Entry Points

Observed pattern from infra docs:

- Web: `https://sprocket.<hostname>`
- API: `https://api.sprocket.<hostname>`
- Infra/ops endpoints also exist, such as Traefik and Vault

Exact production hostnames should be confirmed from the active Pulumi stack before automation is pointed at them.

### State and Side-Effect Contract

`main` production owns:

- the current production database,
- the current production async consumers,
- the current production Redis-backed state,
- the current production notification side effects,
- the current production object-storage paths.

No beta candidate should share this side-effect path during early validation.

### Verification Contract

Required before and after any deployment:

1. Tier 0 environment smoke
2. Tier 1 League Play read path
3. Tier 1 replay submission flow
4. Tier 1 scrim lifecycle
5. targeted Tier 2 side-effect checks as confidence grows

### Promotion Boundary

`main` production is the reference environment used to:

- prove smoke stability,
- establish baseline latency and behavior,
- and compare `v1.5` against a known-good live system.

## Environment B: `v1.5` Beta

### Purpose

Provide a real hosted environment for the monolith-based `v1.5` branch and accept bounded real traffic without risking the current production lane.

### Source of Truth

- Branch: `personal/gankoji/unbork-cloud-spend`
- Worktree: `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15`
- Runtime shape observed from:
  - `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/docker-compose.monolith.yml`
  - `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/package.json`

### Intended Hosting Model

Separate environment in `sprocket-infra`, ideally with its own node or at minimum its own isolated stack boundary.

Target topology:

- `monolith`
- `replay-parse-service`
- optional `web` if it remains separate in the hosted shape
- backing services and shared infra integrations required by those workloads

### External Entry Points

Recommended pattern:

- Web: `https://beta.sprocket.<hostname>` or `https://v15.sprocket.<hostname>`
- API: `https://api.beta.sprocket.<hostname>` or equivalent environment-specific host

The exact scheme should be selected once the Pulumi stack naming is chosen.

### Isolation Requirements

`v1.5` beta must use:

1. separate subdomain,
2. separate Pulumi stack or equivalent environment label,
3. separate queue namespace,
4. separate Redis prefix,
5. separate database or schema target,
6. separate object-storage bucket or prefix policy,
7. separate log queries and dashboards,
8. separate smoke-artifact directory.

### Prohibited Early-Rollout Behavior

Until `v1.5` proves itself, it must not:

- consume the same production async queues as `main`,
- write into the same production Redis namespace,
- share the same mutable production storage paths,
- or act as a transparent traffic split on the current production backend.

### Verification Contract

`v1.5` beta is not valid until it can run the same Tier 0 and Tier 1 verification matrix established on `main`, with only documented branch-specific adaptations.

### Promotion Boundary

`v1.5` beta may progress:

1. from no-user bake-off,
2. to internal-only traffic,
3. to invite-only beta traffic,
4. to cutover rehearsal,

only after repeated verification passes and an explicit rollback plan.

## Shared Data Policy

The default assumption should be isolation, not sharing.

If any state is intentionally shared between `main` and `v1.5`, that shared state must be written down explicitly, including:

- what is shared,
- why it is safe,
- what side effects it can trigger,
- and what rollback looks like.

## Current Unknowns

These items still need to be resolved before hosted automation can be wired up:

1. the exact active production hostnames and stack names,
2. whether `v1.5` will reuse existing frontend services or serve traffic entirely through the monolith shape,
3. the exact queue/Redis naming mechanism used in production config,
4. whether beta data will be cloned, sanitized, or synthetic,
5. the exact artifact storage location for hosted smoke runs.

## Next Update Rule

When the environment contract becomes operational, this file should be updated with:

- actual hostnames,
- actual stack names,
- actual service names,
- actual namespaces/prefixes,
- and links to the automation entrypoints that verify the contract.
