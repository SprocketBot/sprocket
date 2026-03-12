# `v1.5` Infra Mapping

Updated: March 12, 2026

## Purpose

Map the `v1.5` monolith branch onto the current `sprocket-infra` production model so the beta lane can be deployed deliberately instead of improvised.

## Source Inputs

App-side runtime shape:

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/docker-compose.monolith.yml`
- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/apps/monolith/src/main.ts`
- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/apps/monolith/src/monolith.module.ts`
- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15/common/src/util/config.ts`

Infra-side production shape:

- `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/platform/src/Platform.ts`
- `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/platform/src/microservices/SprocketService.ts`
- `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/platform/src/config/services/*.json`

## Current Production Shape

The current hosted `main` platform is modeled as separate services:

- `core`
- `discord-bot`
- `matchmaking-service`
- `notification-service`
- `submission-service`
- `image-generation-service`
- `server-analytics-service`
- `replay-parse-service`
- `elo-service`
- `web`
- `image-generation-frontend`

## `v1.5` Monolith Shape

The `v1.5` branch collapses these seven Node/Nest workloads into one process:

- `core`
- `discord-bot`
- `matchmaking-service`
- `notification-service`
- `submission-service`
- `image-generation-service`
- `server-analytics-service`

The monolith still starts a public HTTP server on port `3001` and also connects RabbitMQ consumers for those absorbed queues.

The following remain outside the monolith:

- `replay-parse-service`
- `web` if deployed separately
- `image-generation-frontend` if still needed

## Important Hosting Decision

`elo-service` is still present in production infra, but the `v1.5` monolith does not obviously absorb it as a standalone hosted service.

The codebase still contains Elo modules and queue usage, so beta hosting must make this explicit:

1. either keep `elo-service` deployed separately in the beta lane,
2. or prove that the monolith-hosted workload fully replaces its runtime behavior.

Until that is proven, the safe assumption is:

- keep `elo-service` as a separate beta-lane dependency.

## Proposed Beta Topology

Minimum hosted `v1.5` beta topology:

- `monolith`
- `replay-parse-service`
- `elo-service`
- `web`

Optional:

- `image-generation-frontend` if that surface is still actively used in beta

Shared platform dependencies:

- Postgres
- Redis
- RabbitMQ
- object storage
- ingress
- monitoring/logging

## Service Mapping

### Replace with Monolith

The beta `monolith` service replaces these current infra services:

- `core`
- `discord-bot`
- `matchmaking-service`
- `notification-service`
- `submission-service`
- `image-generation-service`
- `server-analytics-service`

### Keep Separate

The beta lane should initially keep these as separate deployables:

- `replay-parse-service`
- `elo-service`
- `web`

### Remove from First Beta Cut

These do not need to block the first beta lane unless a concrete user flow requires them:

- `image-generation-frontend`

## Config Mapping

The existing infra builder already provides the important environment identity pieces:

- queue names derived from `pulumi.getStack()`
- Redis prefix derived from `subdomain`
- storage bucket selection derived from environment
- public API and web URLs derived from environment hostnames

That means the beta lane should use:

- a new Pulumi stack name for queue isolation
- a new `subdomain` value for Redis and public identity isolation

## Monolith Config Strategy

The monolith appears able to run on the shared config surface used by the absorbed services:

- transport config
- Redis config
- Postgres config
- MinIO config
- auth config
- web/API public URL config

Practical implication:

- the first beta implementation can likely start from the current `core.json` service config template and extend only where the absorbed modules need additional values.

## Secret Union for Monolith

The beta monolith must receive the union of secrets currently spread across the absorbed services.

Observed required secrets from production infra:

- JWT secret
- MinIO secret key
- MinIO access key
- Google client ID
- Google client secret
- Discord client ID
- Discord client secret
- Discord bot token
- Redis password
- Epic client ID
- Epic client secret
- Steam API key
- Influx token
- Postgres password

This is the main infra delta: the monolith service needs a larger secret set than `core` alone.

## Runtime Contract for Monolith

The beta monolith service should:

- expose port `3001`
- receive ingress labels equivalent to the current `core` API route
- run command equivalent to `node /app/apps/monolith/dist/main.js` or the production build entrypoint
- receive production config at a dedicated path
- join the same platform network set currently used by `core`

## Concrete Infra Change Set

The smallest safe infra change set is:

1. add a new deployable service definition for `monolith`
2. give it API ingress labels replacing `core` in the beta lane
3. attach the merged secret set
4. attach config generated from the existing platform config values
5. keep `replay-parse-service` deployed beside it
6. keep `elo-service` deployed beside it until explicitly retired
7. deploy `web` pointed at the beta API hostname
8. isolate stack/subdomain/database/storage identity from `main`

## First Implementation Recommendation

The first infra implementation should avoid a full refactor of `Platform.ts`.

Instead:

1. add a beta-specific monolith service path,
2. reuse as much of `buildDefaultConfiguration()` as possible,
3. leave the existing `main` production shape untouched.

That keeps the risk localized to the new beta lane.

## Open Questions

These items still need confirmation before editing `sprocket-infra`:

1. what Docker image repository/tag will publish the monolith artifact,
2. whether `web` in `v1.5` remains unchanged enough to reuse the current frontend deploy,
3. whether any absorbed service depended on additional config templates beyond `core` and environment values,
4. whether the beta database will be cloned, sanitized, or synthetic,
5. whether `image-generation-frontend` matters for the first beta cohort.
