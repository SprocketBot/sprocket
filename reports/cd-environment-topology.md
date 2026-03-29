# CD Environment Topology

**Started**: 2026-03-17
**Status**: Draft
**Type**: Project Note

## Overview

This document defines the environment topology for Sprocket's Continuous Deployment system. It is the load-bearing design decision from which all other CD components — GitHub Actions workflow structure, Pulumi stack layout, promotion gates, and rollback strategy — are derived.

## Goals

- Eliminate manual `pulumi up` deployments by automating the full build → deploy → promote pipeline via GitHub Actions and the Pulumi Automation API
- Provide a dev/staging environment for integration testing and canary analysis before changes reach production
- Isolate production from instability on the dev/staging node
- Support per-service independent promotion with a defined rollback path

## Node Topology

```
┌─────────────────────────────┐     ┌────────────────────────────┐
│   dev-staging node          │     │   prod node                │
│   (existing 16 GB Droplet)  │     │   (new Droplet, TBD size)  │
│                             │     │                            │
│  ┌──────────┐ ┌──────────┐  │     │  ┌──────────────────────┐  │
│  │  dev     │ │ staging  │  │     │  │       prod           │  │
│  │  stack   │ │  stack   │  │     │  │       stack          │  │
│  └──────────┘ └──────────┘  │     │  └──────────────────────┘  │
│                             │     │                            │
│  Docker Swarm (single node) │     │  Docker Swarm (single node)│
└─────────────────────────────┘     └────────────────────────────┘
         ▲                                       ▲
         │                                       │
         └──────── GitHub Actions CD ────────────┘
                   (Pulumi Automation API)
```

**Rationale for two nodes:** A production outage caused by a bad dev deployment is unacceptable. Separating prod onto its own node enforces a hard blast-radius boundary. Dev and staging share the existing node since both are non-customer-facing and tolerate instability.

## Pulumi Stack Layout

Three stacks are required:

| Stack | Node | Pulumi Project | Purpose |
|---|---|---|---|
| `shared-infra` | N/A | `infra-shared` | Networking, DNS, GHCR credentials, shared secrets |
| `dev-staging` | dev-staging node | `infra-services` | Dev + staging Swarm stacks, parameterized by environment |
| `prod` | prod node | `infra-services` | Production Swarm stack |

The `infra-services` project is parameterized so `dev-staging` and `prod` are configurations of the same Pulumi program, not separate copies. Environment-specific values (image tags, replica counts, resource limits) live in Pulumi config per stack.

**Current state:** Only `prod` exists today. `shared-infra` and `dev-staging` stacks must be created as part of the CD buildout.

## Services in Scope

- 6 Node.js services
- 1 Python service
- 16+ supporting images (Grafana, Loki, Traefik, etc.)

Supporting images (Grafana, Loki, Traefik) are versioned independently of application services and do not participate in the automated promotion pipeline — they are updated manually via stack config changes.

Application services (the 6+1) are the primary subjects of automated promotion.

## Promotion Flow

```
git push → main
    │
    ▼
GitHub Actions: Build & Push
    - docker build
    - docker push ghcr.io/<org>/<service>:<sha>
    │
    ▼
Deploy to dev (Pulumi Automation API)
    - pulumi up --stack dev-staging (dev config)
    - Swarm: --update-failure-action rollback
    │
    ▼
Promotion gate: dev → staging
    - Service health check passes (/healthz)
    - No OOM/crash-loop in 5-minute soak window
    │
    ▼
Deploy to staging (Pulumi Automation API)
    - pulumi up --stack dev-staging (staging config)
    - Swarm: --update-failure-action rollback
    │
    ▼
Promotion gate: staging → prod
    - Service health check passes
    - Error rate < threshold over 10-minute soak window
    - Manual approval (GitHub Actions environment protection rule)
    │
    ▼
Deploy to prod (Pulumi Automation API)
    - pulumi up --stack prod
    - Swarm: --update-failure-action rollback --update-delay 15s
```

## Rollback Strategy

Rollback is designed before forward-deployment is finalized.

**Automatic (Swarm-level):**
- All Swarm services use `--update-failure-action rollback` and `--rollback-order stop-first`
- Swarm rolls back to the previous task spec automatically on failed health checks during a rolling update
- This is the first line of defense for runtime failures

**Automated pipeline abort:**
- If a health check soak fails at any promotion gate, the GitHub Actions workflow halts and does not promote to the next environment
- The failing environment rolls back via Swarm; upstream environments are unaffected

**Manual rollback workflow:**
- A dedicated `rollback.yml` GitHub Actions workflow accepts a `commit-sha` input
- It resolves the corresponding image tag, runs `pulumi up` with that tag pinned in config, targeting a specified environment
- `latest` is never used as an image reference in any Pulumi stack config — every deployment pins an explicit SHA-tagged image

**Image retention:**
- GHCR images are retained for at least 30 days (GitHub's restore window)
- The last three deployed SHA tags per service per environment are preserved in Pulumi stack config history, making rollback targets immediately known

## Docker Swarm Canary Configuration

Per-service Swarm update config for production:

```
--update-parallelism 1
--update-delay 15s
--update-failure-action rollback
--update-monitor 30s
--rollback-order stop-first
```

This rolls one replica at a time with a 30-second monitor window before promoting the next. If a task fails health checks within that window, Swarm rolls back automatically.

## Open Questions

- [ ] What size Droplet for the prod node? (Current prod is 16 GB — right-sizing after resource audit from infra report)
- [ ] Per-service promotion or grouped? (Recommendation: per-service, but inter-service API contract compatibility needs to be documented first)
- [ ] What constitutes a passing health check for the promotion gate soak window? (Each service needs a `/healthz` or equivalent endpoint defined)
- [ ] Manual approval for prod: who approves, and what is the timeout before auto-cancel?

## Next Actions

- [ ] Create the `dev-staging` Droplet and configure Docker Swarm
- [ ] Refactor Pulumi programs into `shared-infra` and `infra-services` projects (see: ditching-docker/Sprocket-infra-report.md)
- [ ] Create `dev-staging` Pulumi stack with environment-parameterized config
- [ ] Instrument all 7 application services with a `/healthz` endpoint
- [ ] Draft `deploy.yml` and `rollback.yml` GitHub Actions workflows

## Resources

- [[Reaching CI CD Nirvana]] — original vision note
- [[ditching-docker/Sprocket-infra-report]] — current infrastructure state and Pulumi refactor recommendations
- [[ditching-docker/ghcr-migration-plan]] — GHCR migration (prerequisite: all images must be on GHCR before automated CD)

## Log

### 2026-03-17
Initial draft from design conversation. Two-node topology confirmed. Pulumi Automation API approach confirmed. Rollback-first design principle adopted. Per-service promotion deferred pending API contract documentation.

## Tags

#project #sprocket #cd #devops #pulumi #docker-swarm
