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

## Next Check

After deploy, capture actual hosted timings for:

- `getAvailableScrims(status: PENDING)`
- `getCurrentScrim`
- `getScrimMetrics`

If responses are still slow, the next likely targets are the guards/current-user query set and scrim metrics aggregation.
