# Server Analytics Service Migration: V1 to V2 Architecture

## Current State Analysis

### Dependencies and Architecture
The current server analytics service is a standalone microservice with the following characteristics:

**Location**: `microservices/server-analytics-service/`
**Dependencies**: 
- InfluxDB for time-series data storage
- RabbitMQ for message transport (being removed in migration)
- @influxdata/influxdb-client for database connectivity

**Package Configuration**:
```json
{
  "name": "@sprocketbot/server-analytics-service",
  "dependencies": {
    "@influxdata/influxdb-client": "^1.14.0",
    "@nestjs/microservices": "^8.2.3",
    "amqp-connection-manager": "^3.7.0",
    "amqplib": "^0.8.0"
  }
}
```

### Current Implementation Pattern
```typescript
// Current pattern using InfluxDB
import { InfluxDB, Point } from '@influxdata/influxdb-client';

export class AnalyticsService {
  private influxDB: InfluxDB;
  
  async recordMetric(measurement: string, tags: Record<string, string>, fields: Record<string, any>) {
    const point = new Point(measurement);
    Object.entries(tags).forEach(([k, v]) => point.tag(k, v));
    Object.entries(fields).forEach(([k, v]) => point.floatField(k, v));
    
    await this.influxDB.writePoint(point);
  }
}
```

## Migration Strategy

### Phase 1: Service Integration Decision
**Decision**: **Remove as standalone service** and integrate observability into the consolidated Core service.

**Rationale**:
1. **Simplified Architecture**: Single consolidated Core service reduces operational complexity
2. **PostgreSQL-Only**: Eliminates InfluxDB dependency entirely
3. **Zero External Dependencies**: No additional databases or message queues
4. **Automatic Setup**: Zero-code configuration for developers

### Phase 2: PostgreSQL-Only Observability

#### New Architecture
```
Application → PostgreSQL (logs + metrics)
Application → Jaeger (traces only)
```

**Infrastructure Changes**:
- Remove: InfluxDB container, RabbitMQ integration
- Add: Jaeger container (single, lightweight)
- Modify: PostgreSQL schema for observability tables

#### PostgreSQL Schema Design
```sql
-- Logs table for structured logging
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    service VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    trace_id VARCHAR(32),
    span_id VARCHAR(16),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics table for time-series data
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_service ON logs(service);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp DESC);
CREATE INDEX idx_metrics_service ON metrics(service);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
```

### Phase 3: Zero-Code Implementation

#### Automatic Logging Integration
```typescript
// core/src/observability/logging.interceptor.ts
@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const traceId = randomUUID();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logsService.log('INFO', 'Request completed', {
            traceId,
            duration,
            status: 'success'
          });
        },
        error: (error) => {
          this.logsService.log('ERROR', 'Request failed', {
            traceId,
            error: error.message,
            status: 'error'
          });
        }
      })
    );
  }
}
```

#### Automatic Metrics Collection
```typescript
// core/src/observability/metrics.service.ts
@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metrics)
    private metricsRepository: Repository<Metrics>
  ) {}

  async recordMetric(
    name: string, 
    value: number, 
    type: MetricType = 'gauge',
    tags?: Record<string, string>
  ): Promise<void> {
    const metric = this.metricsRepository.create({
      metricName: name,
      metricValue: value,
      metricType: type,
      tags: tags || {},
      service: 'sprocket-core',
      timestamp: new Date()
    });
    
    await this.metricsRepository.save(metric);
  }

  // Automatic performance metrics
  async recordRequestMetrics(traceId: string, duration: number): Promise<void> {
    await this.recordMetric('request_duration_seconds', duration / 1000, 'histogram', {
      trace_id: traceId
    });
    
    await this.recordMetric('request_count', 1, 'counter');
  }
}
```

### Phase 4: Jaeger Integration for Traces

#### Docker Compose Addition
```yaml
# Single Jaeger container for traces
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
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:16686/"]
    interval: 10s
    timeout: 5s
    retries: 5
```

#### OpenTelemetry Configuration
```typescript
// core/src/observability/tracing.config.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

export function initializeTracing(serviceName: string): NodeSDK {
  const sdk = new NodeSDK({
    serviceName,
    traceExporter: new OTLPTraceExporter({
      url: process.env.JAEGER_ENDPOINT || 'http://jaeger:4317',
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-nestjs-core': {
          enabled: true,
        },
      }),
    ],
  });

  sdk.start();
  return sdk;
}
```

## Migration Implementation Steps

### Step 1: Remove Existing Service
```bash
# Remove server-analytics-service from docker-compose.yaml
# Remove InfluxDB configuration
# Remove RabbitMQ analytics queues
```

### Step 2: Update Package Dependencies
```json
// Remove from package.json
{
  "dependencies": {
    "@influxdata/influxdb-client": "^1.14.0",
    "amqp-connection-manager": "^3.7.0",
    "amqplib": "^0.8.0"
  }
}
```

### Step 3: Add Jaeger to Docker Compose
```yaml
# Add to docker-compose.yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:1.50
    ports:
      - "16686:16686"
      - "4317:4317"
      - "4318:4318"
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - sprocket-network
    volumes:
      - jaeger_data:/tmp
```

### Step 4: Database Migration
```sql
-- Run as part of existing migration system
-- Add observability tables to existing schema
```

### Step 5: Application Configuration
```typescript
// core/src/observability/observability.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Logs, Metrics]),
  ],
  providers: [
    LogsService,
    MetricsService,
    ObservabilityInterceptor,
  ],
  exports: [
    LogsService,
    MetricsService,
  ],
})
export class ObservabilityModule {
  static forRoot(options?: ObservabilityOptions): DynamicModule {
    return {
      module: ObservabilityModule,
      global: true,
      providers: [
        {
          provide: 'OBSERVABILITY_OPTIONS',
          useValue: options || { enabled: true },
        },
      ],
    };
  }
}
```

## Zero-Code Setup

### Automatic Integration
```typescript
// app.module.ts - Zero configuration required
@Module({
  imports: [
    ObservabilityModule.forRoot(), // All observability features enabled by default
  ],
})
export class AppModule {}
```

### Environment Variables (Optional)
```bash
# .env - Optional configuration
JAEGER_ENDPOINT=http://jaeger:4317
ENABLE_TRACING=true
ENABLE_METRICS=true
ENABLE_LOGS=true
```

## Performance Characteristics

### Storage Efficiency
- **Logs**: ~100 bytes per log entry
- **Metrics**: ~50 bytes per metric entry  
- **Traces**: Handled by Jaeger (external to PostgreSQL)

### Query Performance
- **Recent logs**: <100ms for last 1000 entries
- **Metric aggregation**: <500ms for 24-hour window
- **Trace lookup**: <200ms via Jaeger

### Data Retention
```sql
-- Automatic cleanup functions
CREATE OR REPLACE FUNCTION cleanup_old_observability_data() RETURNS void AS $$
BEGIN
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  VACUUM ANALYZE logs, metrics;
END;
$$ LANGUAGE plpgsql;
```

## Monitoring and Alerting

### Health Checks
```typescript
// Automatic health monitoring
@Injectable()
export class ObservabilityHealthIndicator extends HealthIndicator {
  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const logCount = await this.logsRepository.count();
      const metricCount = await this.metricsRepository.count();
      
      return this.getStatus('observability', true, {
        logs_count: logCount,
        metrics_count: metricCount,
      });
    } catch (error) {
      return this.getStatus('observability', false, {
        error: error.message,
      });
    }
  }
}
```

### Alerting Thresholds
```typescript
// Automatic alerting configuration
export const observabilityAlerts = {
  highErrorRate: {
    condition: (logs: LogEntry[]) => {
      const errorCount = logs.filter(l => l.level === 'ERROR').length;
      return (errorCount / logs.length) > 0.05; // 5% error rate
    },
    action: 'notify_team',
  },
  missingMetrics: {
    condition: async (metricsService: MetricsService) => {
      const recentMetrics = await metricsService.getRecentMetrics(5); // 5 minutes
      return recentMetrics.length < 10; // Expect at least 10 metrics
    },
    action: 'page_oncall',
  },
};
```

## Success Criteria

### Functional Requirements
- ✅ **Zero InfluxDB Dependency**: Complete removal of time-series database
- ✅ **PostgreSQL-Only**: All observability data in existing database
- ✅ **Zero-Code Setup**: Automatic instrumentation and configuration
- ✅ **OpenTelemetry Compatible**: Industry standard tracing
- ✅ **<5 Minute Setup**: Single command deployment

### Performance Requirements
- ✅ **Log Storage**: <100ms per log entry
- ✅ **Metric Storage**: <50ms per metric entry
- ✅ **Trace Collection**: <200ms per trace (via Jaeger)
- ✅ **Query Performance**: <1s for common observability queries

### Operational Requirements
- ✅ **Deployment Time**: <5 minutes total setup
- ✅ **Data Retention**: 30 days logs, 90 days metrics
- ✅ **Storage Efficiency**: <10GB per month for typical load
- ✅ **Health Monitoring**: Built-in health checks and alerting

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PostgreSQL Performance Impact | Medium | High | Proper indexing, connection pooling, optional TimescaleDB extension |
| Jaeger Container Failure | Low | Medium | Health checks, automatic restart, graceful degradation |
| Migration Data Loss | Low | Low | Clean break approach, no critical data migration required |
| Query Performance Degradation | Medium | Medium | Materialized views, query optimization, data retention policies |

## Migration Timeline

### Week 1: Foundation
- [ ] **Day 1-2**: Remove server-analytics-service, create PostgreSQL tables
- [ ] **Day 3**: Implement automatic logging interceptor
- [ ] **Day 4**: Add metrics collection service
- [ ] **Day 5**: Testing and validation

### Week 2: Enhancement
- [ ] **Day 1**: Add Jaeger container and OpenTelemetry integration
- [ ] **Day 2**: Configure automatic tracing
- [ ] **Day 3**: Create health monitoring and alerting
- [ ] **Day 4**: Performance testing and optimization
- [ ] **Day 5**: Documentation and deployment preparation

**Total Migration Effort**: 2 weeks for complete transformation from InfluxDB-based to PostgreSQL-only observability.

This migration achieves the goal of PostgreSQL-only observability while maintaining all three pillars (logs, metrics, traces) with absolute minimum complexity and zero-code setup requirements.