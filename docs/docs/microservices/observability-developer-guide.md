# Observability Developer Guide: PostgreSQL-Only Architecture

## Quick Start (Zero-Code Setup)

### 1. Automatic Integration
Your NestJS application automatically gets full observability with zero configuration:

```typescript
// app.module.ts - Zero code required
@Module({
  imports: [
    // Observability is automatically included in CoreModule
    CoreModule.forRoot(),
  ],
})
export class AppModule {}
```

### 2. Environment Variables (Optional)
Only set these if you want to customize behavior:

```bash
# .env (optional - defaults work out of the box)
JAEGER_ENDPOINT=http://jaeger:4317
ENABLE_TRACING=true
ENABLE_METRICS=true
ENABLE_LOGS=true
```

### 3. Verify Setup
```bash
# Check Jaeger UI
open http://localhost:16686

# Check PostgreSQL tables
docker-compose exec postgres psql -U postgres -d sprocket_db -c "SELECT COUNT(*) FROM logs;"
```

## The Three Pillars in PostgreSQL

### 1. Logs (PostgreSQL)
```typescript
// Automatic - happens behind the scenes
this.logsService.log('INFO', 'User authenticated', {
  userId: 'user123',
  method: 'google',
  duration: 234,
});
```

**Storage**: PostgreSQL `logs` table
**Query**: 
```sql
SELECT * FROM logs 
WHERE service = 'matchmaking' 
  AND level = 'ERROR' 
  AND timestamp > NOW() - INTERVAL '1 hour';
```

### 2. Metrics (PostgreSQL)
```typescript
// Automatic - system collects performance metrics
this.metricsService.recordMetric('request_duration_seconds', 0.234, 'histogram', {
  endpoint: 'POST /api/matches',
  status_code: '200',
});
```

**Storage**: PostgreSQL `metrics` table  
**Query**:
```sql
SELECT 
  metric_name,
  AVG(metric_value) as avg_value,
  COUNT(*) as count
FROM metrics 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metric_name;
```

### 3. Traces (Jaeger)
```typescript
// Automatic - OpenTelemetry instrumentation
// No code needed - traces flow automatically to Jaeger
```

**Storage**: Jaeger backend (single container)
**Query**: Jaeger UI at http://localhost:16686

## Development Patterns

### Adding Custom Logging
```typescript
// In your service
import { Injectable } from '@nestjs/common';
import { LogsService } from '@sprocketbot/common';

@Injectable()
export class YourService {
  constructor(private readonly logsService: LogsService) {}

  async yourMethod(userId: string) {
    // Custom log with structured data
    this.logsService.log('INFO', 'Processing user request', {
      userId,
      action: 'calculate_score',
      metadata: { game: 'rocket_league' }
    });

    // Your business logic here
  }
}
```

### Adding Custom Metrics
```typescript
// In your service
import { Injectable } from '@nestjs/common';
import { MetricsService, MetricType } from '@sprocketbot/common';

@Injectable()
export class YourService {
  constructor(private readonly metricsService: MetricsService) {}

  async processGameResult(gameId: string, result: GameResult) {
    // Custom metric for business logic
    await this.metricsService.recordMetric(
      'game_processing_duration_seconds',
      result.processingTime / 1000,
      'histogram',
      {
        game_id: gameId,
        game_type: result.gameType,
        success: result.success.toString()
      }
    );
  }
}
```

### Adding Custom Tracing (Advanced)
```typescript
// Usually not needed - automatic instrumentation handles most cases
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('your-service');

async function yourOperation() {
  return tracer.startActiveSpan('your-operation', async (span) => {
    try {
      // Your operation here
      span.setAttribute('custom.attribute', 'value');
      return result;
    } finally {
      span.end();
    }
  });
}
```

## Database Queries for Development

### Log Analysis
```sql
-- Recent errors by service
SELECT 
  service,
  COUNT(*) as error_count,
  MAX(timestamp) as last_error
FROM logs 
WHERE level = 'ERROR' 
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY service
ORDER BY error_count DESC;

-- Search logs by trace ID (correlation)
SELECT * FROM logs 
WHERE trace_id = 'your-trace-id'
ORDER BY timestamp;
```

### Metrics Analysis
```sql
-- Request rate over time
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  COUNT(*) as request_count
FROM metrics 
WHERE metric_name = 'request_count'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY time_bucket
ORDER BY time_bucket;

-- Response time percentiles
SELECT 
  percentile_cont(0.50) WITHIN GROUP (ORDER BY metric_value) as p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY metric_value) as p99
FROM metrics 
WHERE metric_name = 'request_duration_seconds'
  AND timestamp > NOW() - INTERVAL '1 hour';
```

## Performance Guidelines

### Log Levels Usage
```typescript
// Use appropriate log levels
this.logsService.log('DEBUG', 'Detailed debugging info', { data });     // Development only
this.logsService.log('INFO', 'Normal operation events', { userId });      // Normal flow
this.logsService.log('WARN', 'Unexpected but handled', { reason });  // Warnings
this.logsService.log('ERROR', 'Actual errors', { error });               // Errors
this.logsService.log('FATAL', 'System cannot continue', { critical });    // Critical
```

### Metric Types
```typescript
// Choose appropriate metric types
await this.metricsService.recordMetric('active_users', 42, 'gauge');        // Point-in-time value
await this.metricsService.recordMetric('requests_total', 1, 'counter');     // Ever-increasing
await this.metricsService.recordMetric('request_duration', 0.234, 'histogram'); // Distribution
```

### Tag Best Practices
```typescript
// Good tags (low cardinality)
{
  service: 'matchmaking',
  environment: 'production',
  game_type: 'rocket_league',
  status_code: '200'
}

// Avoid (high cardinality)
{
  user_id: 'user123',           // Too many unique values
  request_id: 'req456',          // Unique per request
  exact_timestamp: '123456789'   // Use timestamp field instead
}
```

## Debugging Common Issues

### No Logs Appearing
```bash
# Check PostgreSQL connection
docker-compose logs postgres

# Check application logs
docker-compose logs your-service

# Verify logs table exists
docker-compose exec postgres psql -U postgres -d sprocket_db -c "\d logs"
```

### No Traces in Jaeger
```bash
# Check Jaeger is running
docker-compose ps | grep jaeger

# Check Jaeger UI
curl http://localhost:16686/api/services

# Check OpenTelemetry configuration
docker-compose logs your-service | grep "opentelemetry"
```

### High Database Load
```bash
# Check active queries
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
  FROM pg_stat_activity 
  WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"
```

## Advanced Configuration

### Custom Sampling (Traces)
```typescript
// For high-traffic services - reduce trace sampling
const tracingConfig = {
  sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
};
```

### Custom Retention
```typescript
// Configure data retention per service
const retentionConfig = {
  logs_retention_days: 30,
  metrics_retention_days: 90,
  traces_retention_days: 7,
};
```

### External Integrations
```typescript
// Grafana integration (optional)
const grafanaConfig = {
  url: 'http://grafana:3000',
  datasource: {
    name: 'PostgreSQL',
    type: 'postgres',
    url: process.env.DATABASE_URL,
  }
};
```

## Testing Your Implementation

### Unit Test Example
```typescript
describe('YourService', () => {
  let service: YourService;
  let logsService: jest.Mocked<LogsService>;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: LogsService, useValue: { log: jest.fn() } },
        { provide: MetricsService, useValue: { recordMetric: jest.fn() } },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    logsService = module.get(LogsService);
    metricsService = module.get(MetricsService);
  });

  it('should log and metric operations', async () => {
    await service.yourMethod('user123');
    
    expect(logsService.log).toHaveBeenCalledWith(
      'INFO',
      'Processing user request',
      expect.objectContaining({ userId: 'user123' })
    );
    
    expect(metricsService.recordMetric).toHaveBeenCalled();
  });
});
```

### Integration Test Example
```typescript
describe('Observability Integration', () => {
  it('should store logs in PostgreSQL', async () => {
    // Trigger some application activity
    await request(app.getHttpServer())
      .post('/api/test')
      .expect(201);

    // Verify logs were created
    const logs = await app.get(LogsService).getRecentLogs(1);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].service).toBe('test-service');
  });
});
```

## Migration Checklist

### Before You Start
- [ ] PostgreSQL is running and accessible
- [ ] Jaeger container is running (check http://localhost:16686)
- [ ] Your service has CoreModule imported

### During Development
- [ ] Logs appear in PostgreSQL when you trigger actions
- [ ] Metrics are recorded for your operations
- [ ] Traces appear in Jaeger UI
- [ ] Health checks pass

### Before Production
- [ ] Performance test with realistic load
- [ ] Set up log aggregation queries
- [ ] Configure alerting thresholds
- [ ] Set up data retention policies
- [ ] Document your custom metrics and logs

## Common Patterns

### Request Logging Pattern
```typescript
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceId = randomUUID();
    
    // Log request start
    this.logsService.log('INFO', 'Request started', {
      method: request.method,
      url: request.url,
      traceId,
    });

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logsService.log('INFO', 'Request completed', {
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration: Date.now() - startTime,
            traceId,
          });
        },
        error: (error) => {
          this.logsService.log('ERROR', 'Request failed', {
            method: request.method,
            url: request.url,
            error: error.message,
            duration: Date.now() - startTime,
            traceId,
          });
        }
      })
    );
  }
}
```

### Business Metrics Pattern
```typescript
@Injectable()
export class BusinessMetricsService {
  constructor(private readonly metricsService: MetricsService) {}

  async recordUserRegistration(userId: string, registrationMethod: string) {
    // Business metric
    await this.metricsService.recordMetric(
      'user_registrations_total',
      1,
      'counter',
      {
        method: registrationMethod,
        success: 'true'
      }
    );
  }

  async recordMatchCompletion(matchId: string, gameType: string, duration: number) {
    // Multiple related metrics
    const promises = [
      this.metricsService.recordMetric('matches_completed_total', 1, 'counter', {
        game_type: gameType,
      }),
      this.metricsService.recordMetric(
        'match_duration_seconds',
        duration / 1000,
        'histogram',
        {
          game_type: gameType,
        }
      ),
    ];
    
    await Promise.all(promises);
  }
}
```

This guide provides everything you need to implement observability in your services with zero-code setup and PostgreSQL-only architecture.