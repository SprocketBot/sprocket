# Observability Migration Plan: From InfluxDB to PostgreSQL-Only Architecture

## Executive Summary

This document outlines the migration strategy from the current server analytics service (InfluxDB + RabbitMQ) to a PostgreSQL-only observability solution that maintains the three pillars of observability (logs, metrics, traces) with absolute minimum complexity and zero-code setup requirements.

**Key Benefits:**
- ✅ Eliminates InfluxDB dependency
- ✅ Maintains RabbitMQ elimination (already planned)
- ✅ PostgreSQL-only infrastructure
- ✅ Zero-code automatic setup
- ✅ OpenTelemetry compatible
- ✅ <5 minute deployment time

## Current State Analysis

### Dependencies Being Removed
```yaml
# Current V1 Analytics Service Dependencies
services:
  server-analytics-service:
    dependencies:
      - InfluxDB (time-series database)
      - RabbitMQ (message transport) - Already being removed
      - @influxdata/influxdb-client
```

### Current Data Flow
```
Application → RabbitMQ → Analytics Service → InfluxDB
```

### Current Schema
```typescript
// InfluxDB Line Protocol Format
{
  measurement: "server_metrics",
  tags: {
    service: "matchmaking",
    host: "server-1", 
    environment: "production"
  },
  fields: {
    cpu_usage: 45.2,
    memory_usage: 67.8,
    request_count: 1250,
    response_time: 0.234
  },
  timestamp: "2024-01-15T10:30:00Z"
}
```

## Target Architecture

### Infrastructure Stack
```
PostgreSQL (Existing)
├── Logs table (JSONB structured logs)
├── Metrics table (time-series data) 
└── Jaeger (1 container for traces only)
```

### Data Flow
```
Application → PostgreSQL (logs + metrics)
Application → Jaeger (traces only)
```

### Why Jaeger for Traces?
**Rationale**: While PostgreSQL *could* store traces, the OpenTelemetry ecosystem and tooling compatibility strongly favor a dedicated trace backend. A single lightweight Jaeger container provides maximum standards compliance with minimal complexity overhead.

## Migration Strategy

### Phase 1: Logs Migration (PostgreSQL-Only)
**Duration**: 1-2 days
**Complexity**: Low
**Code Changes**: None (automatic)

#### Implementation
```sql
-- PostgreSQL schema for logs
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level VARCHAR(20) NOT NULL,
    service VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    trace_id VARCHAR(32),
    span_id VARCHAR(16)
);

-- Performance indexes
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_service ON logs(service);
CREATE INDEX idx_logs_trace_id ON logs(trace_id) WHERE trace_id IS NOT NULL;
```

#### Automatic Integration
```typescript
// NestJS automatic logging (zero code)
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const traceId = randomUUID();
    return next.handle().pipe(
      tap({
        next: () => this.logToPostgres('INFO', 'Request completed', { traceId }),
        error: (error) => this.logToPostgres('ERROR', 'Request failed', { traceId, error })
      })
    );
  }
}
```

### Phase 2: Metrics Migration (PostgreSQL + Optional TimescaleDB)
**Duration**: 2-3 days  
**Complexity**: Medium
**Code Changes**: Service configuration only

#### Option A: Standard PostgreSQL (Recommended)
```sql
-- PostgreSQL schema for metrics
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    tags JSONB DEFAULT '{}'
);

-- Performance indexes
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp DESC);
CREATE INDEX idx_metrics_service ON metrics(service);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp_service ON metrics(timestamp DESC, service);
```

#### Option B: TimescaleDB (If Available)
```sql
-- Enable TimescaleDB for better time-series performance
CREATE EXTENSION IF NOT EXISTS timescaledb;
SELECT create_hypertable('metrics', 'timestamp');
```

#### Metrics Collection Service
```typescript
@Injectable()
export class MetricsService {
  async recordMetric(name: string, value: number, type: MetricType, tags?: Record<string, string>): Promise<void> {
    const metric = this.metricsRepository.create({
      metricName: name,
      metricValue: value,
      metricType: type,
      tags: tags || {},
      service: 'current-service',
      timestamp: new Date()
    });
    await this.metricsRepository.save(metric);
  }
}
```

### Phase 3: Traces with Jaeger (Single Container)
**Duration**: 1 day
**Complexity**: Low  
**Infrastructure**: +1 container

#### Docker Compose Addition
```yaml
jaeger:
  image: jaegertracing/all-in-one:1.50
  ports:
    - "16686:16686"  # Jaeger UI
    - "4317:4317"    # OTLP gRPC
    - "4318:4318"    # OTLP HTTP
  environment:
    - COLLECTOR_OTLP_ENABLED=true
  networks:
    - sprocket-network
  volumes:
    - jaeger_data:/tmp
```

#### OpenTelemetry Configuration
```typescript
// Automatic tracing setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export function initializeTracing(serviceName: string): NodeSDK {
  return new NodeSDK({
    serviceName,
    traceExporter: new OTLPTraceExporter({
      url: process.env.JAEGER_ENDPOINT || 'http://jaeger:4317',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
}
```

## Implementation Roadmap

### Week 1: Foundation
- [ ] **Day 1-2**: Set up PostgreSQL tables (logs, metrics)
- [ ] **Day 3**: Implement automatic logging interceptor
- [ ] **Day 4**: Add metrics collection service
- [ ] **Day 5**: Testing and validation

### Week 2: Enhancement  
- [ ] **Day 1**: Add Jaeger container and configuration
- [ ] **Day 2**: Configure OpenTelemetry integration
- [ ] **Day 3**: Create Grafana dashboards (optional)
- [ ] **Day 4**: Performance testing and optimization
- [ ] **Day 5**: Documentation and deployment

## Zero-Code Setup Implementation

### Automatic Instrumentation
```typescript
// app.module.ts - Zero configuration
@Module({
  imports: [
    ObservabilityModule.forRoot({
      logs: true,      // Automatic
      metrics: true,   // Automatic  
      traces: true,    // Automatic
    }),
  ],
})
export class AppModule {}
```

### Environment Configuration
```bash
# .env - Minimal configuration
ENABLE_TRACING=true
ENABLE_METRICS=true
ENABLE_LOGS=true
JAEGER_ENDPOINT=http://jaeger:4317
```

## Docker Compose Integration

### Complete Configuration
```yaml
version: '3.8'

services:
  # PostgreSQL (enhanced for observability)
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/init-observability.sql:/docker-entrypoint-initdb.d/20-observability.sql
    environment:
      POSTGRES_DB: sprocket_db
      POSTGRES_USER: postgres  
      POSTGRES_PASSWORD: postgres

  # Jaeger (new - for traces only)
  jaeger:
    image: jaegertracing/all-in-one:1.50
    ports:
      - "16686:16686"  # Jaeger UI
      - "4317:4317"    # OTLP gRPC  
      - "4318:4318"    # OTLP HTTP
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - sprocket-network
    volumes:
      - jaeger_data:/tmp
    depends_on:
      - postgres

  # Application services (updated)
  server-analytics-service:
    build: ./microservices/server-analytics-service
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sprocket_db
      - JAEGER_ENDPOINT=http://jaeger:4317
      - ENABLE_TRACING=true
      - ENABLE_METRICS=true  
      - ENABLE_LOGS=true
    depends_on:
      postgres:
        condition: service_healthy
      jaeger:
        condition: service_healthy

networks:
  sprocket-network:
    driver: bridge

volumes:
  postgres_data:
  jaeger_data:
```

## Migration Commands

### Step 1: Start New Infrastructure
```bash
# Backup current setup
cp docker-compose.yaml docker-compose.yaml.backup

# Start new observability stack
docker-compose up -d jaeger

# Verify services are healthy
docker-compose ps | grep -E "(postgres|jaeger)"
```

### Step 2: Database Migration
```bash
# Run database initialization
docker-compose exec postgres psql -U postgres -d sprocket_db -f /docker-entrypoint-initdb.d/20-observability.sql

# Verify tables were created
docker-compose exec postgres psql -U postgres -d sprocket_db -c "\dt"
```

### Step 3: Application Update
```bash
# Update application configuration
# Remove InfluxDB/RabbitMQ dependencies
# Add PostgreSQL/Jaeger configuration

# Restart application services
docker-compose restart server-analytics-service
```

### Step 4: Verification
```bash
# Check logs are flowing
docker-compose exec postgres psql -U postgres -d sprocket_db -c "SELECT COUNT(*) FROM logs;"

# Check metrics collection
docker-compose exec postgres psql -U postgres -d sprocket_db -c "SELECT COUNT(*) FROM metrics;"

# Check Jaeger traces
curl http://localhost:16686/api/services
```

## Performance Optimization

### Database Indexing Strategy
```sql
-- Critical indexes for query performance
CREATE INDEX CONCURRENTLY idx_logs_timestamp_service ON logs(timestamp DESC, service);
CREATE INDEX CONCURRENTLY idx_metrics_timestamp_name ON metrics(timestamp DESC, metric_name);
CREATE INDEX CONCURRENTLY idx_metrics_service_timestamp ON metrics(service, timestamp DESC);
```

### Data Retention Policy
```sql
-- Automatic cleanup functions
CREATE OR REPLACE FUNCTION cleanup_old_observability_data() RETURNS void AS $$
BEGIN
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  VACUUM ANALYZE logs, metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
SELECT cron.schedule('observability-cleanup', '0 2 * * *', 'SELECT cleanup_old_observability_data();');
```

## Monitoring and Alerting

### PostgreSQL Health Checks
```sql
-- Service health monitoring
SELECT 
  service,
  CASE WHEN MAX(timestamp) > NOW() - INTERVAL '5 minutes' THEN 'HEALTHY' ELSE 'UNHEALTHY' END as status
FROM logs 
GROUP BY service;

-- Error rate monitoring
SELECT 
  service,
  ROUND(COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / COUNT(*), 2) as error_rate_pct
FROM logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service;
```

### Alerting Thresholds
```yaml
# Example alerting rules
alerts:
  - name: HighErrorRate
    condition: "error_rate > 5%"
    duration: 5m
    action: notify_team
  
  - name: ServiceDown
    condition: "no_logs_for_service > 5m"
    duration: 2m
    action: page_oncall
```

## Success Criteria

### Functional Requirements
- ✅ **Zero InfluxDB Dependency**: No external time-series database
- ✅ **Zero RabbitMQ Dependency**: Uses PostgreSQL for message transport
- ✅ **PostgreSQL-Only**: All observability data in existing database
- ✅ **Automatic Setup**: No manual configuration required
- ✅ **OpenTelemetry Compatible**: Industry standard tracing

### Performance Requirements
- ✅ **Log Storage**: <100ms per log entry
- ✅ **Metric Storage**: <50ms per metric entry  
- ✅ **Trace Collection**: <200ms per trace
- ✅ **Query Performance**: <1s for common queries

### Operational Requirements
- ✅ **Deployment Time**: <5 minutes total setup
- ✅ **Data Retention**: 30 days logs, 90 days metrics
- ✅ **Storage Efficiency**: <10GB per month for typical load
- ✅ **Monitoring**: Built-in health checks and alerting

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PostgreSQL Performance Degradation | Medium | High | Proper indexing, connection pooling, optional TimescaleDB |
| Jaeger Container Failure | Low | Medium | Health checks, automatic restart, trace loss acceptable |
| Data Migration Complexity | Low | Medium | Clean break approach, no historical data migration required |
| Query Performance Issues | Medium | Medium | Materialized views, query optimization, retention policies |

## Next Steps

1. **Week 1**: Implement PostgreSQL tables and automatic logging
2. **Week 2**: Add metrics collection and Jaeger integration  
3. **Week 3**: Performance testing and optimization
4. **Week 4**: Documentation, monitoring setup, production deployment

**Total Migration Effort**: 2-3 weeks for complete observability transformation.

This migration plan achieves the goal of PostgreSQL-only observability while maintaining all three pillars (logs, metrics, traces) with absolute minimum complexity and zero-code setup requirements.