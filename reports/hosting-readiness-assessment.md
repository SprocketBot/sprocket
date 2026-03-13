# Hosting Readiness Assessment

Updated: March 12, 2026

## Purpose

This document reframes release readiness around the question that matters most right now:

Can each Sprocket branch be hosted and operated safely in a real environment?

This assessment incorporates the separate infrastructure repo:

- `sprocket-infra`: `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra`

## Key Finding

For `v1`, hosting is not primarily an application-code question. It is an infrastructure compatibility question.

The current Sprocket production platform is modeled in `sprocket-infra` as a three-layer Pulumi deployment targeting Docker Swarm on DigitalOcean, with managed PostgreSQL and S3-compatible object storage.

That means:

1. `v1` is hostable because the infrastructure path already exists.
2. `v1.5` is only hostable if it can either fit into this infrastructure model with limited changes or justify a new production deployment path.
3. `v2` is not a hosting candidate until its authoritative deployment contract is explicit.

## What Exists in `sprocket-infra`

Observed from the infra repo:

- documented production architecture in `docs-output/ARCHITECTURE.md`
- deployment runbook in `docs-output/DEPLOYMENT_GUIDE.md`
- cloud deployment notes in `CLOUD_DEPLOYMENT.md`
- local/domain routing notes in `LOCAL_ACCESS.md`
- three Pulumi layers:
  - `layer_1`
  - `layer_2`
  - `platform`
- a single-node Docker Swarm deployment model
- managed PostgreSQL
- S3-compatible storage via DigitalOcean Spaces
- Redis and RabbitMQ in the platform/data layers
- Vault- and Pulumi-backed secret injection
- Traefik-based ingress and TLS

The architecture doc describes the current platform as roughly a 22-service system across three layers, with the app layer including:

- web
- core API
- Discord bot
- image-generation frontend
- notification service
- image-generation service
- server-analytics service
- matchmaking service
- replay-parse service
- submission service
- plus legacy services in some environments

## Hosting Model by Branch

## `main` (`v1`)

### Hosting Compatibility

`main` is strongly aligned with the current infra model.

Evidence:

- service names in `platform/src/Platform.ts` correspond directly to the service topology in the current repo,
- the infra repo has config templates for:
  - `web`
  - `discord-bot`
  - `image-generation-frontend`
  - `notification-service`
  - `image-generation-service`
  - `server-analytics-service`
  - `matchmaking-service`
  - `replay-parse-service`
  - `submission-service`
- the infra repo injects the exact classes of dependencies current `v1` expects:
  - Postgres
  - Redis
  - RabbitMQ
  - S3-compatible storage
  - secrets files for OAuth/API tokens

### Hosting Read

This is the only lane that is clearly deployable using an existing production-shaped infrastructure path.

### Main Hosting Risks

1. Operational complexity remains high because the deployment model spans many services.
2. Infra knowledge is concentrated in `sprocket-infra`.
3. Release confidence still depends on rehearsing the full deployment and verification flow, not just local Docker.

### Practical Implication

If the near-term goal is to get something customer-facing moving again, `main` has the shortest path because infra already knows how to host it.

## `personal/gankoji/unbork-cloud-spend` (`v1.5`)

### Hosting Compatibility

`v1.5` is application-real, but infra compatibility is currently unproven.

Evidence:

- the branch has a monolith source tree and a monolith-specific compose file,
- but the infra repo does not appear to contain any explicit monolith deployment path,
- and `platform/src/Platform.ts` is still built around the current multi-service topology.

No observed infra evidence currently shows:

- a monolith image entry,
- a monolith service definition,
- monolith config templates,
- monolith-specific ingress rules,
- or a cutover path from multi-service to single-process runtime.

### Hosting Read

`v1.5` is hostable only after one of two things happens:

1. the existing Pulumi platform layer is adapted to deploy the monolith in place of the current app services, or
2. a parallel deployment path is built and validated.

### Main Hosting Risks

1. The application may be simpler to run, but infra may become more complicated during transition.
2. Existing monitoring, config generation, image publishing, and service-level secrets injection are currently shaped around the old topology.
3. Even if monolith works locally, that does not mean it slots cleanly into the Swarm/Pulumi deployment system.

### Practical Implication

`v1.5` should be treated as a hosting bake-off candidate, not a ready-to-deploy optimization.

Its first hosting question is:

"Can we express `v1.5` in `sprocket-infra` with limited, reversible changes?"

If the answer is no, `v1.5` is not the next production move.

## `dev` (`v2`)

### Hosting Compatibility

`v2` currently has the weakest hosting story.

Evidence:

- the branch/worktree itself does not present a clear authoritative deployment contract,
- your convenience checkout `sprocket_dev` has a Bun + Docker Compose runtime,
- but the current infra repo does not obviously model that architecture as a production deployment target,
- and there is no observed bridge showing how `v2` maps onto existing Pulumi services, config generation, secrets handling, routing, or image publication.

### Hosting Read

`v2` is not yet a production hosting candidate.

It may be runnable. It may be architecturally promising. But it is not yet operationally integrated.

### Main Hosting Risks

1. No authoritative production deployment path is evident.
2. Infra and branch docs are not aligned.
3. A launch would likely require both application stabilization and new infra work at the same time, which is exactly the kind of coupled migration that goes wrong.

### Practical Implication

`v2` should not be evaluated as "can this replace prod soon?"

It should be evaluated as:

"Can one bounded capability from `v2` be hosted or shadow-run without replacing the whole platform?"

## What This Changes in the Overall Plan

Before incorporating `sprocket-infra`, the release plan was mostly about branch runtime and migration readiness.

After incorporating `sprocket-infra`, the correct priority becomes:

1. `main` remains the near-term ship lane because hosting already exists.
2. `v1.5` earns a hosting bake-off only if it can fit the current infra shape with modest change.
3. `v2` should be reduced to a bounded pilot capability, not a platform replacement.

## New Hosting Gates

Any lane that wants to be considered production-capable must now pass these gates:

1. A real deployment target exists.
2. Infra code can represent the runtime shape.
3. Secrets/config injection can be generated automatically.
4. Routing/TLS/ingress model is clear.
5. Data dependencies are mapped.
6. Observability/logging path is known.
7. Rollback to current production is straightforward.
8. Verification after deploy is scriptable.

If a branch cannot pass Gate 1 through Gate 4, it is not hostable in practice.

## Immediate Infra-Aware Next Steps

## 1. Add hosting criteria to the branch scorecard

The scorecard should explicitly rate:

- infra compatibility,
- deployment path clarity,
- secrets/config compatibility,
- and rollback complexity.

## 2. Create an infra/service mapping for `main`

Document exactly how the current codebase maps onto:

- Pulumi services,
- image names,
- config templates,
- ingress routes,
- and secrets.

This becomes the baseline for all comparisons.

## 3. Run a `v1.5` infra diff

Answer these concrete questions:

1. Which current platform services disappear under the monolith?
2. Which services remain separate?
3. Which config templates need to merge?
4. Which secrets stay the same?
5. What ingress changes are required?
6. What verification checks need to change?

## 4. Refuse broad `v2` hosting work for now

Until there is one bounded production slice, do not let `v2` become "rewrite app plus rewrite infra at the same time."

## Recommended Decision

If the main concern is "can I host these properly?", the answer today is:

- `v1`: yes, because the hosting system already exists,
- `v1.5`: maybe, but only after an infra compatibility bake-off,
- `v2`: not as a full-platform launch candidate yet.

That means the next concrete work should focus on:

1. proving `main` can still be deployed and verified through `sprocket-infra`,
2. measuring the infra change required for `v1.5`,
3. and keeping `v2` out of the hosting-critical path for now.
