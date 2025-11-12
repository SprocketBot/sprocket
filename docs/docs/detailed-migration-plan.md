# ~~Detailed Migration Plan: Redis & RabbitMQ Removal~~

## ⚠️ DEPRECATED
This plan has been superseded by the [Unified Migration to Monolith + PostgreSQL-Only Architecture](./unified-monolith-migration.md) which provides a more efficient approach by integrating Matchmaking and Submissions into Core, eliminating their Redis dependencies entirely.

## Overview
~~This plan details the step-by-step migration to remove Redis and RabbitMQ from the platform, replacing them with PostgreSQL-backed solutions. The migration is split into two phases: Redis removal, then RabbitMQ removal. Each phase includes code, schema, and deployment changes, with references to affected services and files.~~

**Note**: The approach below is retained for historical reference but should not be implemented as-is. Use the unified migration plan instead.

---

## Phase 1 — Redis Removal

### Discovery & Impacted Areas
- **services/matchmaking/src/redis.ts**: Central Redis connection helper
- **services/matchmaking/src/store/**: CRUD helpers for Scrim object
- **services/matchmaking/src/queue/**: Queue-timeouts logic (uses pexpire)
- **core/src/global/cache.interceptor.ts**: Optional result-cache (rarely used)
- **clients/discord/src/utils/cache.ts**: Simple guild-settings cache

### Data Model Migration
- **Scrim model**: Defined in `lib/src/types/scrim.ts`
- **Queue-timeout keys**: Derived from scrim ID; will become a `scrim_timeouts` table (1-to-1 with scrims)

#### New PostgreSQL Schema (TypeORM)
- `scrims` table
- `scrim_players` table (many-to-one to scrims)
- `scrim_timeouts` table (PK = scrim_id, expires_at timestamp with tz, ON DELETE CASCADE)

### Code-Level Work
#### Service: matchmaking
- Add TypeORM config for core DB
- Replace `redis.ts` with a `data-source.ts` exporting TypeORM DataSource
- Rewrite `store/*` to use TypeORM repositories
- Rewrite timeout logic: use `INSERT ... ON CONFLICT ...` into `scrim_timeouts`, and run a periodic cron to delete/mark expired scrims
- Add unit tests for repositories and cron job (Vitest)

#### Service: core
- Remove `global/cache.interceptor.ts`
- Remove its registration from `core/src/main.ts`

#### Service: clients/discord
- Remove `utils/cache.ts`; replace callers with direct DB lookups or in-memory cache as appropriate

### Deployment / Ops
- Add migrations to `core/migrations` and run `npm run migrate:up` during deploy
- Remove Redis container from `docker-compose.yaml` and `nomad.job.hcl`
- Update `.env.example` to remove `REDIS_*` variables

---

## Phase 2 — RabbitMQ Removal

### Discovery & Impacted Areas
- **services/submission/src/broker.ts**: Publishes "scrim-finished"
- **services/matchmaking/src/broker.ts**: Publishes match-made, consumes scrim-finished ack
- **services/notifications/src/broker.ts**: Consumes various events
- **core/src/global/event-bus.ts**: Thin wrapper for domain events

### Replacement Pattern
- Create `events_<service>` tables (one per producing service)
  - Columns: id (uuid, PK), event_type (text), payload (jsonb), handled (boolean, default false), created_at (timestamp)
- Each consumer service polls its upstream table(s) or optionally uses LISTEN/NOTIFY

### Steps Per Service
#### Producers (matchmaking, submission)
- Replace `broker.publish()` with `EventRepository.save()`
- (Optional) Add stored procedure for outbox pattern if reliability needed

#### Consumers (notifications, core)
- Replace queue listener with periodic job: `SELECT ... WHERE handled = false FOR UPDATE SKIP LOCKED`
- Update `handled` flag after successful processing

### Migrations & Configs
- Add migrations and configs similar to Phase 1
- Remove RabbitMQ image from compose/nomad

---

## Testing
- Write Vitest suites per service covering:
  - Repository CRUD for scrims & events
  - Happy-path integration: matchmaking ➜ submission ➜ notifications (with test DB)
  - Edge cases: scrim expiration, duplicate events

---

## Timeline & Checkpoints
- **Redis migration PRs**: Target 1 week
- Review & deploy to staging; after 48h stability, schedule cutover
- **RabbitMQ migration PRs**: Following week
- Finalize Docker/Nomad manifests and infra clean-up

---

## Next Steps
- Review this plan, especially the proposed tables and service changes. Confirm or suggest adjustments before starting Redis-migration PRs.
