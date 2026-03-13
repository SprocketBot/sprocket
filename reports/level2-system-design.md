# Sprocket Level 2 Spec: Subsystem Design and Behavior

This level collapses the Level 1 class/module inventory into subsystem intent and runtime behavior.

## Scope

Included workspaces:
- `clients/web`
- `clients/image-generation-frontend`
- `core`
- `common`
- `microservices/submission-service`
- `microservices/matchmaking-service`
- `microservices/notification-service`
- `microservices/image-generation-service`
- `microservices/server-analytics-service`
- `clients/discord-bot`

Primary source anchors:
- `core/src/app.module.ts`
- `common/src/events/events.types.ts`
- `common/src/global.module.ts`
- `clients/web/src/lib/api/client.ts`
- `docker-compose.yml`

## 1. System Topology

Sprocket is a NestJS-based distributed system with one primary GraphQL/API core plus specialized RMQ microservices.

Major transport layers:
- GraphQL over HTTP/WebSocket: web client to `core`
- RMQ RPC (`@MessagePattern`): service-to-service request/response through `common` connectors
- RMQ pub/sub topic bus: domain events via `EventsService` and `EventTopic`
- Bull queues on Redis: async workers for scrim timeout and Elo tasks
- Celery task progress: replay parsing callback/progress pipeline

Primary infrastructure state stores:
- PostgreSQL: canonical league/org/identity/schedule/match data (`core/src/database/**`)
- Redis: hot ephemeral state for scrims and replay submissions (`matchmaking` and `submission-service`)
- MinIO: replay objects and generated report card images
- InfluxDB: analytics points via `server-analytics-service`

## 2. Common Contract Layer (`common`)

Intent:
- Provide typed inter-service contracts and adapters so each service can call others without duplicating schema logic.

Owns:
- Endpoint enums + zod input/output schemas (`CoreEndpoint`, `SubmissionEndpoint`, `MatchmakingEndpoint`, etc.)
- RMQ client proxy setup for all services (`common/src/global.module.ts`)
- Event topic definitions and payload schemas (`common/src/events/events.types.ts`)
- Shared infra adapters (`RedisService`, `MinioService`, `CeleryService`, etc.)

Behavior:
- `*Service.send(...)` wrappers parse input/output, apply timeout, and normalize success/error envelopes.
- Event publishing/subscription validates payloads on both publish and consume paths.
- `SprocketEventMarshal` auto-wires event handlers by decorator metadata, making event consumers declarative.

## 3. Core Platform Service (`core`)

Intent:
- Central source of truth for identity, organizations, franchises/players, scheduling, and league match lifecycle.
- Expose GraphQL for user-facing clients and RMQ endpoints for peer services.

Inbound interfaces:
- GraphQL queries/mutations/subscriptions for web client features (scrims, league play, submissions, admin).
- RMQ message endpoints for cross-service reads/writes (many `CoreEndpoint.*` handlers across controllers).

Outbound integrations:
- Calls `submission-service`, `matchmaking-service`, `image-generation-service`, `analytics`, `notification`, and event bus via `common` connectors.
- Uses Bull queues for Elo and scrim timeout processors.

Core bounded contexts:

### 3.1 Identity/Auth

Intent:
- Discord OAuth login + JWT issue/refresh and user/profile lookup.

Behavior:
- `/login` and `/discord/redirect` create access/refresh tokens with org/team claims.
- `/refresh` reissues tokens from refresh JWT.
- GraphQL `me` resolves user + org-scoped member/player context.

Primary anchors:
- `core/src/identity/auth/oauth/oauth.controller.ts`
- `core/src/identity/auth/oauth/oauth.service.ts`
- `core/src/identity/user/user.resolver.ts`

### 3.2 Organization + Configuration

Intent:
- Organization profile/config lookup and moderation settings used by runtime policies.

Behavior:
- Core RMQ endpoints expose guild mappings, transactions webhook, org profile.
- Organization config keys drive queue-ban timing, ratification thresholds, and Discord integration behavior.

Primary anchors:
- `core/src/organization/organization/organization.controller.ts`
- `core/src/configuration/organization-configuration/organization-configuration.service.ts`
- `core/src/database/configuration/organization_configuration_key/organization_configuration_key.enum.ts`

### 3.3 Scrim Orchestration Facade

Intent:
- Provide GraphQL scrim API while delegating scrim runtime state machine to matchmaking microservice.

Behavior:
- Creates/joins/leaves/checks-in/cancels/locks scrims through `MatchmakingService` connector.
- Enforces org/player/skill-group restrictions and former-player bans at resolver guard layer.
- Subscribes to `scrim.*` events and fans them into GraphQL subscriptions (`followCurrentScrim`, `followActiveScrims`, metrics, toggles).
- `ScrimConsumer` handles pop timeout outcomes by applying queue bans and cancelling stale popped scrims.

Primary anchors:
- `core/src/scrim/scrim.mod.resolver.ts`
- `core/src/scrim/scrim.service.ts`
- `core/src/scrim/scrim.consumer.ts`
- `core/src/scrim/scrim-toggle/scrim-toggle.service.ts`

### 3.4 Replay Submission + Finalization Orchestration

Intent:
- User-facing replay upload/ratification API and final transition from validated submission into persistent match/scrim records.

Behavior:
- Upload flow: store replay objects in MinIO, then call submission-service `CanSubmitReplays` and `SubmitReplays`.
- Ratification flow: calls submission-service `CanRatifySubmission` + `RatifySubmission`.
- Subscribes to submission events and pushes live GraphQL updates by submission id.
- On `SubmissionRatified`, finalization subscriber persists round/team/player stats and emits `ScrimSaved` or `MatchSaved`, then triggers Elo job.

Primary anchors:
- `core/src/replay-parse/replay-parse.mod.resolver.ts`
- `core/src/replay-parse/replay-parse.service.ts`
- `core/src/replay-parse/finalization/finalization.subscriber.ts`
- `core/src/replay-parse/finalization/rocket-league/rocket-league-finalization.service.ts`

### 3.5 Scheduling/League Match Context

Intent:
- Season/group/fixture/match representation and league submission readiness state.

Behavior:
- Provides schedule tree (`getScheduleGroups`) and fixture/match GraphQL view used by league pages.
- Match resolver computes `submissionStatus`, `canSubmit`, `canRatify` by querying submission-service.
- `MatchSaved` emission acts as completion trigger for report card and notifications.

Primary anchors:
- `core/src/scheduling/schedule-group/schedule-group.mod.resolver.ts`
- `core/src/scheduling/schedule-fixture/schedule-fixture.resolver.ts`
- `core/src/scheduling/match/match.resolver.ts`
- `core/src/scheduling/match/match.controller.ts`

### 3.6 MLEDB Bridge + Image Generation + Elo

Intent:
- Keep compatibility with legacy MLEDB schema, generate report cards, and run Elo/salary workflows.

Behavior:
- MLEDB services map Sprocket fixtures/matches/scrims to legacy entities and stakeholders.
- Image generation controller exposes `GenerateReportCard` and uses template SQL + image-generation microservice.
- Elo connector schedules external Elo jobs and handles completion/failure callbacks with analytics emission.

Primary anchors:
- `core/src/mledb/mledb-interface.module.ts`
- `core/src/mledb/mledb-match/mledb-match.service.ts`
- `core/src/image-generation/image-generation.service.ts`
- `core/src/elo/elo-connector/elo-connector.service.ts`

## 4. Matchmaking Service (`microservices/matchmaking-service`)

Intent:
- Own real-time scrim queue state machine in Redis.

Owns state:
- Redis `scrim:*` documents: players, status, lobby, game order, submission id, timeout job id.

Behavior:
- Enforces queue invariants: one active scrim per player, mode/group constraints, check-in semantics.
- Scrim lifecycle states: `PENDING -> POPPED -> IN_PROGRESS -> COMPLETE/CANCELLED/EMPTY`.
- On each publish, emits `ScrimMetricsUpdate` + relevant `scrim.*` event through event proxy.
- Runs recurring scrubber (`scrimClock`) to auto-remove expired pending participants.

Primary anchors:
- `microservices/matchmaking-service/src/scrim/scrim.service.ts`
- `microservices/matchmaking-service/src/scrim/scrim-logic/scrim-logic.service.ts`
- `microservices/matchmaking-service/src/scrim/scrim-crud/scrim-crud.service.ts`
- `microservices/matchmaking-service/src/scrim/event-proxy/event-proxy.service.ts`

## 5. Submission Service (`microservices/submission-service`)

Intent:
- Own replay submission documents, parse progress, validation, ratification, and rejection logic.

Owns state:
- Redis `submission:*` documents with items/progress/rejections/ratifiers/status/stats.

Behavior:
- Submission creation computes required ratifications by type/org config (including majority mode).
- Parse pipeline creates Celery tasks per replay, tracks progress, and publishes `SubmissionProgress`.
- Completion pipeline validates replay data (scrim/LFS/match specific), converts stats, transitions to `RATIFYING` or `REJECTED`.
- Ratification path handles cross-franchise constraints and emits ratification/rejection/reset events.
- Validation endpoint can be called directly for diagnostics/UI.

Primary anchors:
- `microservices/submission-service/src/replay-submission/replay-submission.service.ts`
- `microservices/submission-service/src/replay-submission/replay-submission-crud/replay-submission-crud.service.ts`
- `microservices/submission-service/src/replay-submission/replay-submission-ratification/replay-submission-ratification.service.ts`
- `microservices/submission-service/src/replay-validation/replay-validation.service.ts`

## 6. Notification Service (`microservices/notification-service`)

Intent:
- Convert domain events and explicit notification commands into Discord delivery intents.

Behavior:
- Event-driven notifications for scrim lifecycle, submission ratify/reject, match/scrim report cards, queue bans, skill-group changes.
- Pulls additional context from core/matchmaking/redis to format user-facing messages.
- Uses `BotService` endpoints (`SendDirectMessage`, `SendWebhookMessage`, etc.) for final delivery.

Primary anchors:
- `microservices/notification-service/src/scrim/scrim.service.ts`
- `microservices/notification-service/src/submission/submission.service.ts`
- `microservices/notification-service/src/match/match.service.ts`
- `microservices/notification-service/src/notification/notification.service.ts`

## 7. Discord Bot Client (`clients/discord-bot`)

Intent:
- Runtime adapter to Discord APIs for command handling and message transport.

Behavior:
- Exposes bot transport RMQ handlers used by notification-service and core notification calls.
- Runs command marshal manager for prefixed text commands.
- Listens to Sprocket domain events to synchronize Discord roles and nicknames across guilds.
- Supports guild sync workflows (`syncme`, guild member add/update synchronization).

Primary anchors:
- `clients/discord-bot/src/notifications/notifications.service.ts`
- `clients/discord-bot/src/discord/discord.service.ts`
- `clients/discord-bot/src/marshal/commands/command-manager.service.ts`
- `clients/discord-bot/src/sprocket-events/sprocket-events.service.ts`
- `clients/discord-bot/src/events/discord-sync.marshal.ts`

## 8. Image Generation Service (`microservices/image-generation-service`)

Intent:
- Render template SVG + data into report card assets.

Behavior:
- Loads SVG templates from MinIO, applies `data-sprocket` transformations (text/image/fill/stroke), embeds font data, outputs SVG+PNG to MinIO.
- Supports both typed endpoint (`GenerateImage`) and legacy `media-gen.img.create` pattern.

Primary anchors:
- `microservices/image-generation-service/src/image-generation/image-generation.service.ts`
- `microservices/image-generation-service/src/image-generation/svg-transformation/svg-transformation.service.ts`
- `microservices/image-generation-service/src/image-generation/image-generation.controller.ts`

## 9. Analytics Service (`microservices/server-analytics-service`)

Intent:
- Central sink for operational/product analytics points.

Behavior:
- Validates analytics payloads, transforms to Influx points, throttles flush.
- Used heavily by scrim and Elo paths for lifecycle telemetry.

Primary anchors:
- `microservices/server-analytics-service/src/analytics/analytics.controller.ts`
- `microservices/server-analytics-service/src/analytics/analytics.service.ts`

## 10. Web Client (`clients/web`)

Intent:
- User/admin interface for scrims, league play submissions, and moderation tools.

Architecture:
- SvelteKit app with route guards and cookie-backed JWT session.
- URQL-based query/live-query/subscription store abstractions.

Behavioral slices:

### 10.1 Auth and Session
- Login through Discord popup callback.
- Access + refresh tokens saved to cookies.
- Server hook auto-refreshes expired access token via `core /refresh` and rehydrates `session`.

Primary anchors:
- `clients/web/src/routes/auth/login.svelte`
- `clients/web/src/routes/auth/callback.svelte`
- `clients/web/src/hooks.ts`

### 10.2 Scrim UX
- `/scrims` chooses between available queue view vs current scrim view vs disabled/locked states.
- Current scrim view transitions by status and submission state.
- Live updates come from GraphQL subscriptions (`followCurrentScrim`, `followActiveScrims`, metrics).

Primary anchors:
- `clients/web/src/routes/scrims/index.svelte`
- `clients/web/src/lib/components/organisms/scrims/AvailableScrimsView.svelte`
- `clients/web/src/lib/components/organisms/scrims/QueuedView.svelte`
- `clients/web/src/lib/api/queries/scrims/*.store.ts`

### 10.3 League Submission UX
- `/league` displays schedule groups and fixtures.
- `/league/[fixtureId]` computes per-match action state based on `submissionStatus` + `canSubmit/canRatify`.
- `/league/submit/[submissionId]` drives upload, parsing progress, rejection handling, and ratification.

Primary anchors:
- `clients/web/src/routes/league/index.svelte`
- `clients/web/src/routes/league/[fixtureId].svelte`
- `clients/web/src/routes/league/submit/[submissionId].svelte`
- `clients/web/src/lib/components/organisms/submissions/*.svelte`

### 10.4 Admin UX
- Admin route requires org team membership (`MLEDB_ADMIN`) and surfaces toggles/management tables.
- Uses dedicated stores/mutations for restrictions, lock states, game features, and submission admin ops.

Primary anchors:
- `clients/web/src/routes/admin/index.svelte`
- `clients/web/src/lib/components/molecules/AdminSettings/*.svelte`

## 11. Image Generation Frontend (`clients/image-generation-frontend`)

Intent:
- Internal operator UI for template creation/editing/running against report data and image-generation queues/storage.

Behavior:
- SvelteKit routes expose create/edit/run actions per image type.
- Server endpoints list templates/outputs from MinIO and generate upload URLs.
- Run endpoint validates selected filter values and publishes generation requests to image-generation queue patterns.
- Edit flow loads SVG templates and applies local preview/control tooling before writing outputs.

Primary anchors:
- `clients/image-generation-frontend/src/routes/index.svelte`
- `clients/image-generation-frontend/src/routes/edit/[imageType]/[name].svelte`
- `clients/image-generation-frontend/src/routes/api/run/[imageType]/[name].ts`
- `clients/image-generation-frontend/src/routes/api/outputs/*.ts`
- `clients/image-generation-frontend/src/utils/rabbitmq.ts`

## 12. End-to-End Runtime Flows

### Flow A: Competitive Scrim Lifecycle
1. User creates/join scrim via core GraphQL.
2. Core delegates to matchmaking service.
3. Matchmaking mutates Redis scrim state and emits `scrim.*` events.
4. Core relays event updates to web subscriptions.
5. On pop timeout, core scrim consumer issues queue bans + cancels scrim.
6. In-progress scrim gets replay submission id and accepts replay upload through submission-service pipeline.
7. Ratified submission triggers core finalization subscriber.
8. Core persists stats/rounds and emits `ScrimSaved`.
9. Notification-service sends report cards/DMs through discord-bot.
10. Competitive scrims trigger Elo jobs.

### Flow B: League Match Submission Lifecycle
1. League UI fetches fixture/match list from core scheduling resolvers.
2. `canSubmit/canRatify` are resolved by core via submission-service checks.
3. Upload and validation run through submission-service.
4. Ratification completion emits `SubmissionRatified`.
5. Core finalization saves match/rounds + legacy bridge and emits `MatchSaved`.
6. Notification-service generates/sends series report cards and stakeholder notifications.
7. Core schedules Elo calculation for finalized match.

### Flow C: Player Rank/Team Change Notification and Sync
1. Core player operations publish `PlayerSkillGroupChanged` or `PlayerTeamChanged`.
2. Notification-service emits transaction webhook/user notifications.
3. Discord-bot sprocket-events consumer updates guild roles/nickname based on event payload.

## 13. Design Characteristics and Invariants

System-level invariants observed in code:
- Typed inter-service boundaries: every RMQ call path validates zod input/output.
- Scrim membership invariant: a player cannot join multiple active scrims in matchmaking Redis state.
- Submission progression invariant: submissions only finalize after all replay items settle to complete/error and pass validation.
- Match/scrim report cards are downstream of `MatchSaved`/`ScrimSaved` events, not direct UI actions.
- Real-time client state is event-driven; subscriptions are first-class for scrims/submissions/restrictions.

Operational coupling points:
- Core remains central integration coordinator; most peer services depend on core endpoints for enrichment.
- Redis is dual-purpose (ephemeral domain state + queue backing), which ties performance and reliability characteristics together.
- Legacy MLEDB bridge remains embedded in finalization and scheduling paths.
