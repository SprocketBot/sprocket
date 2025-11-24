# Server Analytics Service Migration: Minimal Complexity Observability Plan

## Overview

This document outlines the migration strategy for the server analytics service from its current InfluxDB/RabbitMQ dependency to a PostgreSQL-only observability solution that maintains the three pillars of observability (logs, metrics, traces) with absolute minimum complexity for setup and deployment.

## Current State Analysis

### Server Analytics Service Dependencies
- **InfluxDB**: Time-series data storage for metrics
- **RabbitMQ**: Message transport (being removed in migration)
- **InfluxDB Client Library**: External dependency for data writes
- **Token-based Authentication**: Requires secret file management

### Current Architecture Issues
- External database dependency (InfluxDB)
- Message queue dependency (RabbitMQ)
- Complex authentication setup
- Separate infrastructure to maintain

## Target State: PostgreSQL-Only Observability

### Design Philosophy Alignment
Per our [design philosophy](./design-philosophy.md):
- **Simplicity**: Single database for all observability needs
- **Consolidation**: Remove external dependencies
- **Developer Experience**: Easy to use and understand
- **Operational Ease**: Single container deployment

## Three Pillars Implementation Strategy

### 1. Logs: PostgreSQL with Zero-Code Integration

**Implementation**: Built-in NestJS logger with PostgreSQL storage
**Schema**:
```typescript
@Entity()
class LogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column()
  level: string; // debug, info, warn, error

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column()
  timestamp: Date;

  @Index()
  @Column({ nullable: true })
  traceId: string;
}
```

**Developer Usage** (Zero-code):
```typescript
// Works with existing NestJS logger - no code changes needed
this.logger.log('User action completed', { userId, action });
this.logger.warn('Slow query detected', { query, duration });
```

### 2. Metrics: PostgreSQL with Optional TimescaleDB

**Implementation**: PostgreSQL table with time-series optimization
**Schema**:
```typescript
@Entity()
class MetricPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column()
  metricName: string;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'jsonb', nullable: true })
  labels: Record<string, string>;

  @Column()
  timestamp: Date;

  @Index(['serviceName', 'metricName', 'timestamp'])
  compositeIndex: string;
}
```

**Developer Usage** (Minimal code):
```typescript
// Simple decorator-based metrics
@Measure('http_request_duration')
async handleRequest() {
  // Method automatically timed
}

@Count('user_registrations')
registerUser() {
  // Count automatically incremented
}
```

### 3. Traces: Lightweight Jaeger Container

**Implementation**: Single Jaeger container with memory storage
**Docker Compose Addition**:
```yaml
jaeger:
  image: jaegertracing/all-in-one:1.50
  profiles: [monitoring]
  environment:
    - COLLECTOR_OTLP_ENABLED=true
    - SPAN_STORAGE_TYPE=memory
    - SPAN_STORAGE_MEMORY_MAX_TRACES=10000
  ports:
    - 16686:16686  # Web UI
```

**Developer Usage** (Zero-code with existing tracing):
```typescript
// Already integrated via lib/src/tracing.ts
// Bun --preload ../lib/src/tracing.ts handles automatic instrumentation
```

## Migration Implementation Plan

### Phase 1: PostgreSQL Schema Setup (Day 1)
1. Create LogEntry and MetricPoint entities
2. Generate TypeORM migrations
3. Add indexes for efficient queries

### Phase 2: Code Migration (Day 2-3)
1. Replace InfluxDB client with PostgreSQL repository
2. Update analytics service to use new schema
3. Implement decorator-based metrics
4. Test with existing RabbitMQ events

### Phase 3: Infrastructure Cleanup (Day 4)
1. Remove InfluxDB from docker-compose.yaml
2. Update environment variables
3. Test end-to-end functionality

### Phase 4: Jaeger Integration (Day 5)
1. Add Jaeger container to docker-compose.yaml
2. Verify trace correlation with logs/metrics
3. Document usage for developers

## Docker Compose Integration

The observability stack integrates cleanly with the existing single docker-compose.yaml:

```yaml
# Existing services remain unchanged
services:
  # ... core, matchmaking, web, etc.

  # Monitoring profile (optional)
  grafana:
    # Existing Grafana configuration
    
  jaeger:
    image: jaegertracing/all-in-one:1.50
    profiles: [monitoring]
    environment:
      - COLLECTOR_OTLP_ENABLED=true
      - SPAN_STORAGE_TYPE=memory
    ports:
      - 16686:16686

  # Remove these after migration:
  # redis: (being removed)
  # lavinmq: (being removed)
```

## Developer Experience: Zero-Code to Minimal-Code

### Logging (Zero-Code)
- Existing NestJS logger automatically stores to PostgreSQL
- No code changes required in services
- Automatic trace correlation

### Metrics (Minimal-Code)
```typescript
// Option 1: Decorator (recommended)
@Injectable()
export class UserService {
  @Count('user_created')
  createUser(data: CreateUserDto) {
    // Count automatically tracked
  }

  @Measure('user_query_duration')
  async findUsers() {
    // Duration automatically measured
  }
}

// Option 2: Manual (for complex scenarios)
export class UserService {
  constructor(private metrics: MetricsService) {}

  async complexOperation() {
    const timer = this.metrics.startTimer('complex_operation_duration');
    try {
      // ... operation
      this.metrics.increment('complex_operation_success');
    } catch (error) {
      this.metrics.increment('complex_operation_error');
      throw error;
    } finally {
      timer.end();
    }
  }
}
```

### Tracing (Zero-Code)
- Automatic via existing lib/src/tracing.ts
- All HTTP requests, database queries, and service calls traced
- Correlation with logs via traceId

## Operator Experience: Single Container Management

### Deployment
```bash
# Start with monitoring
docker-compose --profile monitoring up -d

# Or without monitoring (logs/metrics still work)
docker-compose up -d
```

### Access Points
- **Logs**: Query PostgreSQL directly or via Grafana
- **Metrics**: PostgreSQL queries or Grafana dashboards
- **Traces**: Jaeger UI at http://localhost:16686

### Monitoring Queries (PostgreSQL)
```sql
-- Recent errors by service
SELECT service_name, level, COUNT(*) 
FROM log_entry 
WHERE level = 'error' 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service_name, level;

-- Request rate by service
SELECT service_name, 
       COUNT(*) as request_count,
       AVG(value) as avg_duration
FROM metric_point 
WHERE metric_name = 'http_request_duration' 
  AND timestamp > NOW() - INTERVAL '5 minutes'
GROUP BY service_name;

-- Memory usage trend
SELECT timestamp, value 
FROM metric_point 
WHERE metric_name = 'memory_usage_bytes' 
  AND service_name = 'sprocket-core'
ORDER BY timestamp DESC 
LIMIT 100;
```

## Documentation Strategy

### For Developers
1. **Quick Start Guide**: Copy-paste examples for common patterns
2. **API Reference**: Auto-generated from decorators
3. **Best Practices**: When to use logs vs metrics vs traces

### For Operators
1. **Deployment Guide**: Single docker-compose command
2. **Troubleshooting**: Common PostgreSQL queries
3. **Performance Tuning**: Index optimization and retention policies

## Success Criteria

- ✅ Single docker-compose.yaml manages entire observability stack
- ✅ Zero-code logging integration
- ✅ Minimal-code metrics (decorators only)
- ✅ Standards-compliant tracing (OpenTelemetry via Jaeger)
- ✅ PostgreSQL-only for logs and metrics
- ✅ Only one additional container (Jaeger)
- ✅ Comprehensive documentation for both developers and operators

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PostgreSQL performance with high log volume | Partitioning by date, retention policies |
| Jaeger memory usage | Configurable trace limits, optional deployment |
| Developer adoption | Zero-code logging, simple decorator patterns |
| Migration complexity | Phased approach, backward compatibility |

## Next Steps

1. **Immediate**: Implement PostgreSQL schemas and basic logging
2. **Week 1**: Add metrics with decorators
3. **Week 2**: Integrate Jaeger and test end-to-end
4. **Documentation**: Create developer and operator guides
5. **Testing**: Validate with existing services and load

This plan maintains the single docker-compose.yaml requirement while providing comprehensive observability with minimal complexity and maximum developer/operator friendliness.