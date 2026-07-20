# Node Runtime Consolidation Assessment

Current checkout: `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/main`  
Current branch: `agent/limit-db-connections`  
Current commit: `1a13e47b`

## Purpose

Assess whether the current Sprocket Node.js application services can be combined into one runtime process and one Docker image to reduce server memory pressure.

## Short Answer

This is feasible for the backend Node/Nest workloads, but the first safe cut should be:

- one backend Node process for the Nest API/workers/bot,
- one backend Docker image for that process,
- keep `replay-parse-service` separate,
- keep `web` and `image-generation-frontend` separate unless we later decide to serve built frontend assets from the backend image.

That gives the main memory win: fewer V8 heaps, fewer duplicated Nest dependency graphs, and fewer duplicated database/transport client pools. It avoids turning a backend consolidation into a frontend hosting and Python parser migration at the same time.

## Current Backend Candidates

The seven Node/Nest workloads that can plausibly be absorbed into one process are:

| Service | Current entrypoint | Current queue/listener |
| --- | --- | --- |
| `core` | `core/src/main.ts` | HTTP `3001` plus `config.transport.core_queue` |
| `discord-bot` | `clients/discord-bot/src/main.ts` | `config.transport.bot_queue` |
| `matchmaking-service` | `microservices/matchmaking-service/src/main.ts` | HTTP health `3010` plus `config.transport.matchmaking_queue` |
| `notification-service` | `microservices/notification-service/src/main.ts` | HTTP health `3011` plus `config.transport.notification_queue` |
| `submission-service` | `microservices/submission-service/src/main.ts` | HTTP health `3012` plus `config.transport.submission_queue` |
| `image-generation-service` | `microservices/image-generation-service/src/main.ts` | HTTP health `3014` plus `config.transport.image_generation_queue` |
| `server-analytics-service` | `microservices/server-analytics-service/src/main.ts` | HTTP health `3013` plus `config.transport.analytics_queue` |

These all use Nest root `AppModule`s. In the current branch, the service transport is the custom Postgres RPC transport (`PostgresServer`), not RabbitMQ.

## Keep Separate Initially

`replay-parse-service` should stay separate for the first cut. It is a Python image with parser, Rust, and protobuf build dependencies, not just another Node/Nest app.

The SvelteKit frontends should also stay separate initially:

- `clients/web`
- `clients/image-generation-frontend`

They can share a Docker base or later be copied into a combined image, but that does not prove the backend monolith. Keeping them separate gives a cleaner rollout boundary.

`elo-service` is not part of this checkout's local app workspace, but infra still references it as a separate deployable. Do not retire it as part of the first backend monolith unless a separate pass proves the monolith fully replaces its runtime behavior.

## Existing Prototype

There is an existing worktree at:

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/monolith-image`
- branch `codex/monolith-single-node-image`
- commit `d80077ce`

It contains:

- `apps/monolith`
- `apps/monolith/Dockerfile`
- `docker-compose.monolith.yml`
- root workspace wiring for `apps/monolith`

Useful shape from that prototype:

- a dedicated `apps/monolith` workspace,
- `MonolithModule` importing the seven existing root modules,
- a single backend Docker image entrypoint,
- a compose file that runs `monolith` plus shared infra and `replay-parse-service`.

Do not port it blindly. It is stale against this branch in important ways:

- it connects consumers with Nest `Transport.RMQ`;
- the current branch uses `PostgresServer`;
- it carries unrelated workflow/package-lock/service edits;
- it depends on `apps/monolith` source that is not present in this checkout.

## Recommended First Implementation

Add a new `apps/monolith` workspace in the current checkout.

The monolith `main.ts` should:

1. create a Nest HTTP app from `MonolithModule`;
2. apply the same CORS, upload, validation, and exception filter behavior as `core/src/main.ts`;
3. register a direct `GET /healthz` route before normal routing;
4. connect one `PostgresServer` consumer for each absorbed queue:
   - `core_queue`
   - `bot_queue`
   - `matchmaking_queue`
   - `notification_queue`
   - `submission_queue`
   - `image_generation_queue`
   - `analytics_queue`
5. call `startAllMicroservices()`;
6. listen on `3001`.

The monolith `MonolithModule` should import the seven current root modules without moving their source:

- `core/src/app.module`
- `clients/discord-bot/src/app.module`
- `microservices/matchmaking-service/src/app.module`
- `microservices/notification-service/src/app.module`
- `microservices/submission-service/src/app.module`
- `microservices/image-generation-service/src/app.module`
- `microservices/server-analytics-service/src/app.module`

## Required Cleanup

Several services define duplicate `GET /healthz` controllers. They return the same simple payload, so this is not conceptually hard, but the monolith should own the exposed health route explicitly. If duplicate route registration causes unstable behavior, remove or conditionally exclude worker health controllers from the monolith imports.

`server-analytics-service` still imports the `config` npm package directly for Influx settings and reads `secret/influx-token` directly. That should be converted to the shared `@sprocketbot/common` config resolver before monolith rollout, or the monolith must use a config directory and secret layout that satisfies both `core` and analytics.

`image-generation-service` needs `fontconfig` and `fonts/fonts.conf`. The monolith Docker image must include those runtime dependencies.

`dockerfiles/node.Dockerfile` and `dev.Dockerfile` currently copy `clients`, `common`, `core`, and `microservices`, but not `apps`. Any `apps/monolith` implementation must update both image paths.

## Docker Shape

Add a production image at `apps/monolith/Dockerfile` using the existing Node 26 base image contract.

The image should:

- build `common`;
- build `apps/monolith`;
- include backend workspace source needed by TypeScript path imports;
- install image generation font dependencies;
- expose/healthcheck `3001`;
- run `node /app/apps/monolith/dist/.../main.js` using the actual emitted path.

For local development, add `docker-compose.monolith.yml` or a compose profile that starts:

- `postgres`
- `redis`
- `minio`
- `monolith`
- `replay-parse-service`

Do not add RabbitMQ to the monolith compose path unless the transport is intentionally changed back. This branch's Node service-to-service transport is currently Postgres-backed.

## Validation Gate

Minimum proof before treating the monolith as usable:

1. `npm run build --workspace=common`
2. `npm run build --workspace=apps/monolith`
3. build the monolith Docker image
4. start the monolith compose stack
5. `curl http://localhost:3001/healthz`
6. GraphQL smoke:
   ```bash
   curl http://localhost:3001/graphql \
     -H 'Content-Type: application/json' \
     -d '{"query":"{ __typename }"}'
   ```
7. `npm run verify:tier0 -- local-dev`
8. one service-to-service smoke that crosses queues, preferably scrim or submission

Before hosted use, run the Tier 1 `league`, `scrim`, and `submission` harnesses against a monolith-backed lane.

## Rollout Recommendation

Treat this as a new deployable, not as an in-place replacement at first.

Recommended sequence:

1. land `apps/monolith` behind local/dev-only compose support;
2. prove local health, GraphQL, and a queue-crossing CUJ;
3. add the monolith image build without deleting existing service images;
4. wire infra `monolith-mode` only for an isolated beta/dev lane;
5. compare memory and behavior against the current multi-service lane;
6. only then consider replacing production `core` plus worker services.

This preserves rollback: the existing service images and infra service definitions remain available while the monolith proves itself.
