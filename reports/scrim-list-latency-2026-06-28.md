# Scrim List Latency Diagnosis - 2026-06-28

## Problem

After moving scrim queue state from Redis to Postgres, `/scrims` could sit on loading states or take multiple seconds to complete `getAvailableScrims`, `getAllScrims`, or `getActiveScrims`.

## Diagnosis

The initial Postgres repository work had already removed the worst N+1 relation hydration inside matchmaking, but the cross-service read contract was still Redis-shaped:

- core could only ask matchmaking for `GetAllScrims` with an optional single `skillGroupId`
- `getAvailableScrims`, `getAllScrims`, and `getLFSScrims` fetched all active scrims and filtered by organization, status, LFS, and player skill group in core
- GraphQL then resolved `gameMode`, `gameMode.game`, `skillGroup`, and `skillGroup.profile` per returned scrim unless those objects were preloaded

That meant the frontend route could pay for unrelated active scrims from other organizations, plus resolver fanout, before rendering the landing page.

## Change

The scrim read contract now accepts Postgres-friendly filters:

- `organizationId`
- `status`
- `skillGroupId`
- `skillGroupIds`
- `lfs`

Core passes those filters at the matchmaking boundary, and matchmaking applies them directly in `sprocket.scrim_queue`. Core also preloads unique `gameMode.game` and `skillGroup.profile` metadata for scrim-list responses to avoid per-row GraphQL field-resolution queries.

The follow-up migration `1779600000000-ScrimQueueReadIndexes` adds compound indexes for the new read shapes.

## Validation

Commands run:

```bash
npm run build --workspace=common
npm run build --workspace=core
npm run build --workspace=microservices/matchmaking-service
npm run test --workspace=microservices/matchmaking-service -- scrim-postgres.repository.spec.ts --runInBand
```

The focused repository spec now asserts that filtered scrim list reads are pushed into the generated Postgres query.

## Local Timing Check

After opening the PR, a localhost Docker Postgres timing check was run against a throwaway `sprocket_bench_codex` database on port `5434`.

Seed shape:

- 50,000 active `sprocket.scrim_queue` rows
- 200,000 `sprocket.scrim_queue_player` rows
- 200 organizations
- filtered read target: organization `42`, status `PENDING`, skill groups `[2, 4, 6]`

Repository-shaped timings included the primary scrim query plus the batched player and game child-row queries.

| Read shape | Rows returned | Player rows loaded | Median time |
| --- | ---: | ---: | ---: |
| old broad active-scrims read | 50,000 | 200,000 | 539.03 ms |
| new filtered read | 83 | 332 | 2.59 ms |

Observed median speedup for this seeded dataset: `208x`.

This is not a full GraphQL/browser timing because it does not include auth guards, current-user loading, GraphQL serialization, or frontend rendering. It does validate the main Postgres read-shape improvement locally.

## Next Check

After deploy, capture actual hosted timings for:

- `getAvailableScrims(status: PENDING)`
- `getCurrentScrim`
- `getScrimMetrics`

If responses are still slow, the next likely targets are the guards/current-user query set and scrim metrics aggregation.
