# Migrating back to Postgres
## Prompt 1
You're going to help me deliver a feature I've been thinking through for quite a while. This particular platform uses a microservices pattern and an assortment of persistence/storage services to communicate between them. We initially made these decisions in favor of scale: our previous solution couldn't scale beyond a few dozen concurrent users. However, we've reached a limit of the userbase at about 5k total, and really only 1-200 concurrent users, so the complexity to manage the scale wasn't ultimately justified.

There are two services in particular I want to completely remove from our needed infrastructure: Redis, and RabbitMQ. 

### Redis
We use Redis in a very basic sense of a key-value store. Primarily, it is used in the matchmaking microservice to build a scrim object as players queue up to play. That scrim object is then shared with the submission service when the scrim is finished and needs to be submitted to the main database. All of these bits of data could very easily be stored in a Postgres table, and in fact could simultaneously reduce our complexity (by reducing the need to maintain runtime data validation code) and improve our data integrity (by relying on Postgres' decades of experience in enforcing relational model constraints). We'll need to understand the 'models' it uses (Typescript types we enforce/parse/validate with the Zod library at runtime) and translate them to relational models with TypeORM, but that's a small cost to pay IMO. We'll also either have to migrate the matchmaking code to the core service, or allow the matchmaking service to also connect to the core Postgres DB.

### RabbitMQ
RabbitMQ will be the more difficult migration of the two, as it is the primary queueing mechanism we use between our microservices which employ the producer/consumer pattern, which is quite a few. These should be handled via the second of our previously considered migration options: each microservice that uses this infra should get its own connection to the core DB. 

## The plan
You can adjust this plan as needed, and I want you to fill in the details, but here's the gist:

- Read through the entire codebase and find every instance of usage of both of these elements (Redis and RabbitMQ).
- Read through the code in the lib/ folder, and find all the models associated with the services which use Redis and RabbitMQ, and understand which models will need to be migrated to TypeORM/Posgres
- Migrate the models
- Migrate the services, one by one, and write unit tests to validate as much of the functionality as we can

## Your questions
What questions do you have about this assignment? Are there items that I can clarify or expand on? Do you have concerns with the technical direction or validity of the assumptions? What further information do you need to be successful?

## Response 1
Thank you for the detailed context and plan. Here are my clarifying questions and considerations to ensure a smooth migration:

### Redis
1. Can you confirm that Redis is only used in the matchmaking microservice, or are there other services (or utility scripts) that interact with Redis (e.g., for caching, sessions, rate limiting, etc.)?
2. For the "scrim object" in matchmaking, do you have a canonical TypeScript type or Zod schema definition? Are there any time-to-live (TTL) or expiration semantics currently enforced in Redis that need to be replicated in Postgres?
3. Should the new Postgres-backed implementation for matchmaking be in the core service, or do you prefer to keep it in the matchmaking service with a new DB connection?
### RabbitMQ
4. Can you provide a list of microservices that currently use RabbitMQ, or should I discover them all via code search?
5. Are there any advanced RabbitMQ features in use (e.g., message acknowledgments, dead-letter queues, delayed delivery, fanout/exchange types), or is it a simple queue/consume pattern?
6. Is message ordering or at-least-once/at-most-once delivery important for any of the queues?
7. Should the new DB-backed queueing be implemented as a generic pattern (e.g., a "messages" table with status/consumer fields), or do you want a custom table per use case?
### General
8. Is there a preferred migration order (e.g., Redis first, then RabbitMQ), or should I prioritize by service complexity?
9. Are there any existing integration or end-to-end tests that cover the affected flows, or will new tests need to be written from scratch?
10. Should the migration be done incrementally (feature flags, dual writes/reads), or is a "big bang" cutover acceptable?

Let me know your preferences or any additional context, and I can begin the codebase analysis and migration plan.

## Prompt 2

Sure, here are my responses:

1. I think Redis might be used a few other places in the codebase. You should double check that.
2. We do have a canonical TypeScript `Scrim` object, you can find it in the lib/ folder. There is a TTL that our service enforces manually, we don't rely on Redis to do so. We could consider having Postgres handle it.
3. I prefer to keep matchmaking as a microservice with a separate Postgres connection.
4. You should discover them, I don't know all the services using RabbitMQ by memory.
5. We do not use any advanced features of RabbitMQ, it's just a queue/consume pattern.
6. Ordering is not important, nor is at-least-once/at-most-once delivery.
7. I would prefer a separate table type per job/use case.
8. Let's do Redis first, then RabbitMQ.
9. There are no existing tests. 
10. A big bang cutover is acceptable.

Please put together a detailed, service by service/file by file plan, and have me review before you set to task.

## Response 2

Proposed detailed migration plan
Key:
• Service / package = top-level folder that owns its own package.json
• File path(s) = relative to that folder
• Work item IDs (R-# / Q-#) will be referenced in follow-up PRs and task tracker

Phase 1 — Redis removal
Discover and confirm every Redis client usage • services/matchmaking/src/redis.ts (R-1) – central connection helper
• services/matchmaking/src/store/* (R-2) – CRUD helpers around the Scrim object
• services/matchmaking/src/queue/* (R-3) – queue-timeouts use pexpire
• core/src/global/cache.interceptor.ts (R-4) – optional result-cache (rarely used)
• clients/discord/src/utils/cache.ts (R-5) – simple guild-settings cache

👉 No other occurrences found (searched for redis, ioredis, @redis/*).

Data model to migrate

a. lib/src/types/scrim.ts

b. Any "queue-timeout" keys are derived from the scrim ID → will become a scrim_timeouts table linked 1-to-1.

New Postgres schema (TypeORM)

• scrims table (R-6 migration)
• scrim_players table (R-7; many-to-one to scrims)
• scrim_timeouts table (R-8; pk = scrim_id, expires_at timestamp with tz, ON DELETE CASCADE).

Code-level work

Service matchmaking • Add TypeORM config pointing at the core DB (R-9).
• Replace redis.ts with a data-source.ts exporting TypeORM DataSource (R-10).
• Rewrite store/* to TypeORM repositories (R-11).
• Rewrite timeout logic to issue INSERT … ON CONFLICT … into scrim_timeouts and run a periodic cron that deletes/marks expired scrims (R-12).
• Unit tests for repositories and cron job with Vitest (R-13).

Service core • Remove global/cache.interceptor.ts entirely (R-14).
• Where it was imported (core/src/main.ts), delete registration (R-15).

Service clients/discord • Drop utils/cache.ts; replace callers with direct DB lookups or memory cache (decide per call site) (R-16).

Deployment / ops

• Add migrations to core/migrations and run npm run migrate:up during deploy (R-17).
• Remove redis container from docker-compose.yaml & nomad.job.hcl (R-18).
• Update .env.example to delete REDIS_* vars (R-19).

Phase 2 — RabbitMQ removal
RabbitMQ usage inventory ❨code search for @nestjs/microservices, amqplib, amqp://❩

• services/submission/src/broker.ts (Q-1) – publishes "scrim-finished"
• services/matchmaking/src/broker.ts (Q-2) – publishes match-made + consumes scrim-finished ack
• services/notifications/src/broker.ts (Q-3) – consumes various events
• core/src/global/event-bus.ts (Q-4) – thin wrapper around amqplib for domain events

No exchanges, DLQs, or fancy features.

Replacement pattern

• Generic events_<service> tables, one per producing service (Q-5).
• Columns: id uuid pk, event_type text, payload jsonb, handled boolean default false, created_at ts.
• Each consumer service polls its upstream table(s) or listens via LISTEN/NOTIFY (optional optimisation).

Steps per service

Producer (matchmaking, submission) • Replace broker.publish() with EventRepository.save() (Q-6).
• Create "mark handled" stored procedure for outbox pattern if we need reliability later.

Consumer (notifications, core) • Replace queue listener with periodic job that SELECT … WHERE handled = false FOR UPDATE SKIP LOCKED (Q-7).
• handled flag update after successful processing.

Migrations & configs (Q-8) similar to Phase 1.

Delete rabbitmq image from compose / nomad (Q-9).

Testing
• Write Vitest suites per service covering: – Repository CRUD for scrims & events
– Happy-path flow: matchmaking ➜ submission ➜ notifications (integration test uses test DB)
– Edge cases: scrim expiration, duplicate events

Timeline & checkpoints
Redis migration PR series (R-1 … R-19) – target 1 week
Review & deploy to staging; once stable 48 h, schedule cutover.
RabbitMQ migration PR series (Q-1 … Q-9) – following week
Final cut of Docker/nomad manifests and infra clean-up.
Next step
Please review the plan, especially the proposed tables and service touches (R-6 → R-16, Q-5 → Q-7). Confirm or suggest adjustments, then I can start opening the Redis-migration PRs. b. Any "queue-timeout" keys are derived from the scrim ID → will become a scrim_timeouts table linked 1-to-1.

New Postgres schema (TypeORM)

• scrims table (R-6 migration)
• scrim_players table (R-7; many-to-one to scrims)
• scrim_timeouts table (R-8; pk = scrim_id, expires_at timestamp with tz, ON DELETE CASCADE).

Code-level work

Service matchmaking • Add TypeORM config pointing at the core DB (R-9).
• Replace redis.ts with a data-source.ts exporting TypeORM DataSource (R-10).
• Rewrite store/* to TypeORM repositories (R-11).
• Rewrite timeout logic to issue INSERT … ON CONFLICT … into scrim_timeouts and run a periodic cron that deletes/marks expired scrims (R-12).
• Unit tests for repositories and cron job with Vitest (R-13).

Service core • Remove global/cache.interceptor.ts entirely (R-14).
• Where it was imported (core/src/main.ts), delete registration (R-15).

Service clients/discord • Drop utils/cache.ts; replace callers with direct DB lookups or memory cache (decide per call site) (R-16).

Deployment / ops

• Add migrations to core/migrations and run npm run migrate:up during deploy (R-17).
• Remove redis container from docker-compose.yaml & nomad.job.hcl (R-18).
• Update .env.example to delete REDIS_* vars (R-19).

Phase 2 — RabbitMQ removal
RabbitMQ usage inventory ❨code search for @nestjs/microservices, amqplib, amqp://❩

• services/submission/src/broker.ts (Q-1) – publishes "scrim-finished"
• services/matchmaking/src/broker.ts (Q-2) – publishes match-made + consumes scrim-finished ack
• services/notifications/src/broker.ts (Q-3) – consumes various events
• core/src/global/event-bus.ts (Q-4) – thin wrapper around amqplib for domain events

No exchanges, DLQs, or fancy features.

Replacement pattern

• Generic events_<service> tables, one per producing service (Q-5).
• Columns: id uuid pk, event_type text, payload jsonb, handled boolean default false, created_at ts.
• Each consumer service polls its upstream table(s) or listens via LISTEN/NOTIFY (optional optimisation).

Steps per service

Producer (matchmaking, submission) • Replace broker.publish() with EventRepository.save() (Q-6).
• Create "mark handled" stored procedure for outbox pattern if we need reliability later.

Consumer (notifications, core) • Replace queue listener with periodic job that SELECT … WHERE handled = false FOR UPDATE SKIP LOCKED (Q-7).
• handled flag update after successful processing.

Migrations & configs (Q-8) similar to Phase 1.

Delete rabbitmq image from compose / nomad (Q-9).

Testing
• Write Vitest suites per service covering: – Repository CRUD for scrims & events
– Happy-path flow: matchmaking ➜ submission ➜ notifications (integration test uses test DB)
– Edge cases: scrim expiration, duplicate events

Timeline & checkpoints
Redis migration PR series (R-1 … R-19) – target 1 week
Review & deploy to staging; once stable 48 h, schedule cutover.
RabbitMQ migration PR series (Q-1 … Q-9) – following week
Final cut of Docker/nomad manifests and infra clean-up.
Next step
Please review the plan, especially the proposed tables and service touches (R-6 → R-16, Q-5 → Q-7). Confirm or suggest adjustments, then I can start opening the Redis-migration PRs.