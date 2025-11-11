# Sprocket Observability Solution

## Overview

This document describes the complete observability solution implemented for the Sprocket project. The solution provides zero-code observability with automatic logging, metrics collection, and distributed tracing capabilities.

## Architecture

### Components

1. **PostgreSQL Tables** - Stores logs and metrics data
2. **NestJS Interceptors** - Automatic request/response logging and metrics
3. **Jaeger** - Distributed tracing and APM
4. **Grafana** - Visualization and dashboards
5. **Tempo** - Trace aggregation
6. **Loki** - Log aggregation
7. **Vector** - Log routing and processing

### Data Flow

```
Application → Interceptor → Observability Service → PostgreSQL
     ↓
  Jaeger ← Tempo ← Grafana
     ↓
  Loki ← Vector
```

## Implementation Details

### 1. Database Schema

#### Logs Table
```sql
CREATE TABLE "sprocket"."logs" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
    "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
    "level" character varying NOT NULL,
    "message" text NOT NULL,
    "context" character varying,
    "service" character varying NOT NULL,
    "method" character varying,
    "path" character varying,
    "statusCode" integer,
    "duration" integer,
    "error" text,
    "trace" text,
    "userId" uuid,
    "requestId" character varying,
    "traceId" character varying,
    "spanId" character varying,
    "tags" jsonb,
    CONSTRAINT "PK_logs_id" PRIMARY KEY ("id")
);
```

#### Metrics Table
```sql
CREATE TABLE "sprocket"."metrics" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
    "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
    "name" character varying NOT NULL,
    "value" numeric NOT NULL,
    "type" character varying NOT NULL,
    "unit" character varying,
    "service" character varying NOT NULL,
    "method" character varying,
    "path" character varying,
    "labels" jsonb,
    "userId" uuid,
    "requestId" character varying,
    "traceId" character varying,
    "spanId" character varying,
    CONSTRAINT "PK_metrics_id" PRIMARY KEY ("id")
);
```

### 2. NestJS Interceptors

#### ObservabilityInterceptor
- Automatically logs all HTTP requests and responses
- Records performance metrics
- Captures error information
- Generates trace and span IDs
- Sanitizes sensitive data

#### Usage
```typescript
@Controller()
@UseInterceptors(ObservabilityInterceptor)
export class MyController {
  // All methods are automatically instrumented
}
```

### 3. Zero-Code Integration

#### Core Service Integration
The observability is automatically enabled by including the `ObservabilityModule` in the Core service:

```typescript
@Module({
  imports: [
    ObservabilityModule, // Enables automatic observability
    // ... other modules
  ]
})
export class AppModule {}
```

#### Manual Logging and Metrics
Developers can also manually log and record metrics:

```typescript
constructor(private observabilityService: ObservabilityService) {}

async myMethod() {
  // Manual logging
  await this.observabilityService.info('User created', 'UserService', {
    userId: user.id,
    service: 'user-service'
  });

  // Manual metrics
  await this.observabilityService.incrementCounter('users_created_total', 1, {
    method: 'POST',
    status: 'success'
  });
}
```

### 4. Jaeger Integration

Jaeger is configured in `docker-compose.yaml`:
```yaml
jaeger:
  image: jaegertracing/all-in-one:latest
  profiles: [monitoring]
  ports:
    - 16686:16686  # Jaeger UI
    - 14268:14268  # Jaeger collector HTTP
    - 14250:14250  # Jaeger collector gRPC
    - 6831:6831/udp  # Jaeger agent compact
    - 6832:6832/udp  # Jaeger agent binary
  environment:
    - COLLECTOR_OTLP_ENABLED=true
    - SPAN_STORAGE_TYPE=elasticsearch
```

### 5. Testing

#### Test Endpoints
The implementation includes test endpoints to verify functionality:

- `GET /test-observability/log-test` - Tests manual logging
- `GET /test-observability/metric-test` - Tests manual metrics
- `GET /test-observability/auto-instrumentation-test` - Tests auto-instrumentation
- `GET /test-observability/error-test` - Tests error handling

#### Test Script
Run the test script to verify the implementation:
```bash
./test-observability.sh
```

## Usage Guide

### For Developers

1. **Automatic Instrumentation**: All HTTP requests are automatically logged and measured
2. **Manual Logging**: Use the observability service for custom logs
3. **Custom Metrics**: Record business metrics using the observability service
4. **Error Tracking**: Errors are automatically captured and logged

### For Operators

1. **Jaeger UI**: Access distributed tracing at `http://jaeger.localhost:16686`
2. **Grafana UI**: Access dashboards at `http://grafana.localhost:3000`
3. **Database Queries**: Direct PostgreSQL access for custom queries
4. **Log Aggregation**: Loki provides centralized log aggregation

## Migration

Run the database migration to create observability tables:
```bash
./migrate-up
```

## Configuration

### Environment Variables
- `JAEGER_URL`: Jaeger UI URL (default: `jaeger.localhost`)
- `GRAFANA_URL`: Grafana UI URL (default: `grafana.localhost`)

### Interceptor Options
```typescript
{
  serviceName: 'sprocket-core',
  logRequests: true,
  logResponses: true,
  logErrors: true,
  trackMetrics: true,
  excludePaths: ['/health', '/metrics', '/favicon.ico', '/graphql']
}
```

## Performance Considerations

- **Asynchronous Processing**: Logging and metrics are processed asynchronously
- **Database Indexes**: Optimized indexes for fast queries
- **Hypertables**: TimescaleDB hypertables for time-series data (if available)
- **Data Retention**: Automatic cleanup of old logs and metrics

## Security

- **Data Sanitization**: Sensitive fields are automatically redacted
- **Access Control**: Observability UIs are protected by Traefik
- **Audit Trail**: All operations are logged for security auditing

## Monitoring

The solution provides comprehensive monitoring of:
- HTTP request/response times
- Error rates and types
- User activity
- System performance
- Business metrics

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Jaeger UI**: Check that Jaeger container is running with `monitoring` profile
3. **Missing Data**: Verify the migration has been run successfully
4. **Performance**: Check database indexes and query performance

### Debug Commands

```bash
# Check database tables
psql -U postgres -d postgres -c '\dt sprocket.*'

# Check recent logs
psql -U postgres -d postgres -c 'SELECT * FROM sprocket.logs ORDER BY timestamp DESC LIMIT 10;'

# Check recent metrics
psql -U postgres -d postgres -c 'SELECT * FROM sprocket.metrics ORDER BY timestamp DESC LIMIT 10;'

# Check service health
curl http://localhost:3000/health
```

## Future Enhancements

- **Alerting**: Integration with alerting systems
- **Custom Dashboards**: Pre-built Grafana dashboards
- **SLA Monitoring**: Service level agreement tracking
- **Cost Optimization**: Data retention policies
- **Machine Learning**: Anomaly detection capabilities

## Conclusion

This observability solution provides comprehensive monitoring capabilities with minimal developer overhead. The zero-code approach ensures that all services are automatically instrumented, while manual controls allow for custom logging and metrics when needed.