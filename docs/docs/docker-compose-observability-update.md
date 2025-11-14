# Docker Compose Observability Update

## Add to Existing docker-compose.yaml

Add these services to your existing `docker-compose.yaml` file to enable the new observability stack:

```yaml
  # Add to the services section, before the existing monitoring services

  jaeger:
    image: jaegertracing/all-in-one:1.50
    profiles: [monitoring]
    environment:
      - COLLECTOR_OTLP_ENABLED=true
      - SPAN_STORAGE_TYPE=memory
      - SPAN_STORAGE_MEMORY_MAX_TRACES=10000
    ports:
      - 16686:16686
    networks:
      - sprocket-net

  # Update existing monitoring services to include jaeger dependency
  grafana:
    image: grafana/grafana:latest
    profiles: [monitoring]
    depends_on:
      - postgres
      - jaeger
    volumes:
      - ./config/grafana/datasources.yaml:/etc/grafana/provisioning/datasources/ds.yaml:ro
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_DISABLE_LOGIN_FORM=true
      - GF_FEATURE_TOGGLES_ENABLE=traceqlEditor traceQLStreaming metricsSummary
    labels:
      traefik.enable: true
      traefik.http.routers.grafana.rule: Host(`${GRAFANA_URL:-grafana.localhost}`)
      traefik.http.routers.grafana.entrypoints: web,websecure
      traefik.http.services.grafana.loadbalancer.server.port: 3000
    networks:
      - sprocket-net

  tempo:
    image: grafana/tempo
    profiles: [monitoring]
    depends_on:
      - jaeger
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./config/tempo/tempo.yaml:/etc/tempo.yaml:ro
    networks:
      - sprocket-net
```

## Complete Updated docker-compose.yaml Structure

Here's how your services section should look after the update:

```yaml
services:
  # Core application services (unchanged)
  traefik:
    # ... existing traefik config

  core:
    # ... existing core config

  # Add jaeger here
  jaeger:
    image: jaegertracing/all-in-one:1.50
    profiles: [monitoring]
    environment:
      - COLLECTOR_OTLP_ENABLED=true
      - SPAN_STORAGE_TYPE=memory
      - SPAN_STORAGE_MEMORY_MAX_TRACES=10000
    ports:
      - 16686:16686
    networks:
      - sprocket-net

  # Update existing monitoring services
  grafana:
    image: grafana/grafana:latest
    profiles: [monitoring]
    depends_on:
      - postgres
      - jaeger  # Add this dependency
    # ... rest of grafana config

  tempo:
    image: grafana/tempo
    profiles: [monitoring]
    depends_on:
      - jaeger  # Add this dependency
    # ... rest of tempo config

  # ... other existing services
```

## What Changes

### New Services Added:
1. **jaeger**: Distributed tracing with web UI at port 16686

### Updated Services:
1. **grafana**: Now depends on jaeger for trace visualization
2. **tempo**: Now depends on jaeger for trace correlation

### Services Removed (Eventually):
1. **redis**: No longer needed for analytics
2. **lavinmq**: Being replaced with PostgreSQL events

## Verification

After updating your docker-compose.yaml:

1. **Start with monitoring profile**:
   ```bash
   docker-compose --profile monitoring up -d
   ```

2. **Check jaeger is running**:
   ```bash
   docker-compose ps | grep jaeger
   ```

3. **Access jaeger UI**:
   Open http://localhost:16686 in your browser

4. **Verify trace collection**:
   - Make some API requests to your application
   - Check jaeger UI for traces
   - Verify traces correlate with logs in grafana

## Rollback Instructions

If you need to rollback:

1. **Remove jaeger service** from docker-compose.yaml
2. **Remove jaeger dependencies** from grafana and tempo
3. **Restart without monitoring**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Memory Impact

Adding jaeger increases memory usage by approximately **50MB** when the monitoring profile is enabled. This is the only additional resource overhead for complete observability.

## Next Steps

After updating docker-compose.yaml:

1. **Update your application code** to use the new PostgreSQL-based observability (see observability-developer-guide.md)
2. **Test the complete stack** with your existing services
3. **Remove redis and lavinmq** once you've confirmed everything works
4. **Update your .env file** to remove REDIS and LAVIN references