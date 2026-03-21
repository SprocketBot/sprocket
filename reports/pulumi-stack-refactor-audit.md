# Pulumi Stack Refactor Audit

Updated: March 21, 2026

## Scope

This audit is the A1 input for [reports/plan-02-pulumi-stack-refactor.md](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/reports/plan-02-pulumi-stack-refactor.md). It catalogs the current Pulumi programs under `infra/` and maps them to the target `infra-shared` and `infra-services` layout.

## Current Pulumi Programs

### `infra/foundation`

Purpose:
- DigitalOcean Droplet provisioning
- reserved IP creation and assignment
- DNS record creation
- DigitalOcean firewall creation
- first-boot cloud-init bootstrap

Primary resource types:
- `digitalocean.SshKey`
- `digitalocean.Tag`
- `digitalocean.Droplet`
- `digitalocean.ReservedIp`
- `digitalocean.ReservedIpAssignment`
- `digitalocean.DnsRecord`
- `digitalocean.Firewall`

Important outputs:
- `DropletId`
- `DropletName`
- `PublicIp`
- `ReservedIp`
- `FirewallId`
- `DeployUser`
- `DnsNames`
- `SshKeyFingerprints`
- `BootstrapMode`

Operational note:
- This stack already encodes the plan's desired "node creation is Pulumi-managed and first-boot setup is cloud-init" direction.
- It is currently one-environment-per-stack via flat config like `foundation:environment`.

### `infra/layer_1`

Purpose:
- ingress and edge services

Primary resource types:
- `docker.Network`
- `docker.Volume`
- `docker.Service`

Current resources:
- Traefik
- Discord forward-auth sidecar
- Docker socket proxy

Important outputs:
- `IngressNetwork`

Operational note:
- This stack is a thin wrapper over shared components in [infra/global/services/traefik/Traefik.ts](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/infra/global/services/traefik/Traefik.ts).

### `infra/layer_2`

Purpose:
- shared data plane and monitoring services

Primary resource types:
- `docker.Network`
- `docker.Volume`
- `docker.Service`
- `postgresql.Provider`

Current resources:
- monitoring bundle via `Monitoring`
- Redis
- Gatus
- overlay network for Chatwoot/platform access

Important outputs consumed elsewhere:
- `MonitoringNetworkId`
- `PostgresHostname`
- `PostgresPort`
- `RedisHostname`
- `RedisPassword`
- `RedisPublicHostname`
- `RedisPublicPort`
- `RedisPublicTls`
- `RedisPublicConnectionString`
- `MinioUrl`
- `MinioAccessKey`
- `MinioSecretKey`

Operational note:
- This stack currently depends on `layer_1` via `StackReference`.
- The shared services it provisions are candidates for the future `infra-shared` stack.

### `infra/platform`

Purpose:
- application and platform service deployment

Primary resource types:
- `docker.Network`
- `docker.Service`
- `docker.Secret`
- `aws.Provider` for S3-compatible buckets
- `random.RandomUuid`

Current application services and clients:
- `core`
- `monolith`
- `web`
- `discord-bot`
- `image-generation-frontend`
- `image-generation-service`
- `matchmaking-service`
- `notification-service`
- `replay-parse-service`
- `server-analytics-service`
- `submission-service`
- `elo-service`

Important dependencies:
- `layer_1` stack reference for ingress network
- `layer_2` stack reference for Redis, Postgres, MinIO, monitoring

Operational note:
- The service deployment code is already centralized in [infra/platform/src/Platform.ts](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/infra/platform/src/Platform.ts), but it is still tied to the `layer_1` / `layer_2` split and to stack-name assumptions baked into `infra/global/refs/types.ts`.

## Host-Level Resources Still Outside The New Target Layout

The plan calls out host-level resources that must end up in `infra-shared`. Current status:

- Droplets: already in `infra/foundation`
- firewalls: already in `infra/foundation`
- DNS records: already in `infra/foundation`
- SSH key assignment: already in `infra/foundation`
- cloud-init bootstrap: already in `infra/foundation`
- shared Docker services: still split across `layer_1` and `layer_2`
- Docker secrets/configs used by all services: currently created ad hoc in `platform`

The remaining gap is not "foundation missing from Pulumi"; it is "foundation and shared Docker substrate are split across multiple stacks and naming conventions."

## Duplication And Drift Risks

### Stack reference drift

The shared stack reference helper in [infra/global/refs/types.ts](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/infra/global/refs/types.ts) hardcodes references in the form:

- `gankoji/foundation/foundation`
- `gankoji/layer_1/layer_1`
- `gankoji/layer_2/layer_2`

This makes project name, stack name, and backend org assumptions part of the source layout.

### Split shared-service ownership

Shared infrastructure is divided across:
- `foundation`
- `layer_1`
- `layer_2`

That split makes it harder to reason about:
- which resources are safe to recreate together
- which outputs define the deploy contract for application services
- how a new dev/staging node should converge from scratch

### Environment handling drift

Current environment handling mixes:
- Pulumi stack name
- flat config keys such as `subdomain`
- hardcoded defaults in [infra/global/constants.ts](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/infra/global/constants.ts)
- template stack YAML files like [infra/foundation/Pulumi.dev-staging.template.yaml](/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/infra/foundation/Pulumi.dev-staging.template.yaml)

The new model should move toward:
- a single `infra-shared` stack holding both nodes and shared substrate
- a single `infra-services` project with environment-specific config per stack

## Inter-Program Dependency Map

Current dependency chain:

1. `foundation`
2. `layer_1`
3. `layer_2`
4. `platform`

Concrete dependencies:
- `layer_2` depends on `layer_1.IngressNetwork`
- `platform` depends on `layer_1.IngressNetwork`
- `platform` depends on `layer_2` for Postgres, Redis, MinIO, monitoring

Practical result:
- the application deployment path cannot be previewed or refactored independently from the older stack graph

## Mapping To The Target Layout

### Move into `infra-shared`

From `foundation`:
- Droplet
- reserved IP
- DNS
- firewall
- SSH key assignment
- cloud-init bootstrap outputs

From `layer_1`:
- Traefik
- socket proxy
- Discord forward-auth
- ingress overlay network

From `layer_2`:
- monitoring bundle
- shared Redis
- Gatus
- any shared overlay networks used by services

### Move into `infra-services`

From `platform`:
- all application services
- service-specific Docker secrets/configs
- environment-specific scale, image tag, and resource settings

## Recommended First Implementation Slice

The safest additive path is:

1. Preserve existing `infra/*` stacks while new projects are introduced.
2. Port the current `foundation` logic into a new `infra-shared` project first.
3. Define a new config and stack-reference contract for `infra-services`.
4. Delay live service migration until the new outputs and config shape are stable.

That is the slice implemented on branch `codex/pulumi-stack-refactor-start`.

## Newly Confirmed Blocker

While testing the first real shared-service migration candidate (`Traefik`), importing `infra/global` from the new `infra-shared` project exposed a packaging boundary problem:

- `infra/global` works today as a local helper package inside the legacy `infra/*` stack layout
- as a dependency of a new standalone project, it pulls in the entire legacy surface
- that surface is not currently clean as a reusable package boundary for cross-project type-checking

Practical implication:

- the next migration step should start by extracting a narrow reusable module for shared Docker components, or by copying the required Traefik/Redis helpers into a new refactor-local package, instead of directly depending on the full legacy `global` package from `infra-shared`
