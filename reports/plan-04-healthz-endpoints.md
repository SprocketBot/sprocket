# Plan 04: Instrument Healthz Endpoints

**Status**: Not started
**Prerequisite for**: Plan 05 (promotion gate soak checks depend on these)
**Depends on**: Nothing — can be done in parallel with Plans 01–03
**App repos**: The 6 Node.js services and 1 Python service

## Context

Each of the 7 application services needs a `/healthz` HTTP endpoint. This endpoint is used by:
1. Docker Swarm's `HEALTHCHECK` instruction — determines if a container is healthy during rolling updates
2. The promotion gate logic in the CD pipeline — a soak check polls this endpoint before promoting to the next environment
3. Traefik — can be configured to remove an unhealthy backend from rotation

A `/healthz` endpoint must:
- Return HTTP 200 when the service is operating normally
- Return HTTP 503 (or any non-200) if the service is in a degraded state
- Respond within 2 seconds (slow health checks mask real problems)
- Not require authentication
- Not be routed externally (Traefik should strip or block this path from public traffic)

A `/readyz` endpoint is optional but valuable: it signals that the service is ready to accept traffic (e.g., database connections established), as distinct from merely being alive.

---

## Manual Steps

### M1 — Decide what "healthy" means per service
For each service, the engineering team must decide what checks belong in `/healthz`:
- **Liveness** (is the process running?): just return 200 — this is the minimum
- **Dependency checks** (can the service reach its database / downstream services?): more meaningful but can cause cascading failures if a dependency is down
- **Recommendation**: liveness only in `/healthz`; dependency checks in `/readyz` if implemented

Document this decision before the agent implements the endpoints, so the implementation is consistent.

### M2 — Identify which services exist and where their repos live
Confirm the list of 6 Node.js services and 1 Python service and their repository locations. The agent needs this list to know where to make changes.

---

## Agent Steps

These should be run against each application service repo.

### A1 — Add `/healthz` to each Node.js service (NestJS / Express)

**If NestJS** — add a health module using `@nestjs/terminus`:
```typescript
// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}

// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('healthz')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);  // liveness only; add indicators as needed
  }
}
```

Register `HealthModule` in `AppModule`.

**If plain Express**:
```typescript
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
```

Register this route before any auth middleware so it does not require a token.

### A2 — Add `/healthz` to the Python service (FastAPI / Flask)

**If FastAPI**:
```python
@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
```

**If Flask**:
```python
@app.route("/healthz")
def healthz():
    return {"status": "ok"}, 200
```

Register this route before any auth decorators.

### A3 — Add Docker HEALTHCHECK to each Dockerfile
In each service's `Dockerfile`, add a `HEALTHCHECK` instruction:
```dockerfile
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:<PORT>/healthz || exit 1
```

Use `wget` rather than `curl` to avoid adding curl as a dependency. Adjust `<PORT>` to each service's listen port.

### A4 — Block `/healthz` from external routing in Traefik config
In the `infra-services` Pulumi project, add a Traefik middleware that strips `/healthz` from public routing. This prevents the health endpoint from being publicly reachable:

```typescript
labels: {
    // existing routing labels...
    "traefik.http.routers.my-service.middlewares": "strip-healthz@docker",
    "traefik.http.middlewares.strip-healthz.replacepathregex.regex": "^/healthz.*",
    "traefik.http.middlewares.strip-healthz.replacepathregex.replacement": "/404",
}
```

Alternatively, add a firewall rule that drops requests to `/healthz` at the network edge.

### A5 — Add a basic health check integration test
In each service's test suite, add a test that:
- Starts the service (or uses an existing test server)
- Makes a GET request to `/healthz`
- Asserts HTTP 200 and `{ "status": "ok" }` (or equivalent)

This ensures the endpoint doesn't regress silently.

---

## Validation Checklist

- [ ] `curl http://localhost:<port>/healthz` returns 200 on every service locally
- [ ] `docker inspect --format='{{json .State.Health}}' <container>` shows `"Status": "healthy"` after deploy
- [ ] Swarm `docker service ps <service>` shows no health-check-triggered restarts
- [ ] Traefik logs do not show `/healthz` requests from external traffic
- [ ] Health check integration test passes in CI for each service

## Tags

#project #sprocket #cd #healthz #observability
