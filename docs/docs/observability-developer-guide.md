# Observability Developer Guide: Zero-Code to Minimal-Code

## Quick Start (2 minutes)

### 1. Logging (Zero Code Required)
Your existing NestJS logger automatically stores to PostgreSQL. Just use it:

```typescript
import {Logger} from "@nestjs/common";

export class YourService {
  private readonly logger = new Logger(YourService.name);
  
  yourMethod() {
    this.logger.log('Something happened', {userId: '123', action: 'login'});
    this.logger.warn('Slow operation', {duration: 5000});
    this.logger.error('Something broke', error.stack);
  }
}
```

**That's it!** Logs automatically appear in PostgreSQL with trace correlation.

### 2. Metrics (One Line of Code)
Add the `@Count` or `@Measure` decorator to any method:

```typescript
import {Count, Measure} from '@sprocketbot/observability';

export class UserService {
  @Count('user_created')
  createUser(data: CreateUserDto) {
    // This method call is automatically counted
  }

  @Measure('database_query_duration')
  async findUsers() {
    // This method's duration is automatically measured
    return this.db.query('SELECT * FROM users');
  }
}
```

### 3. Tracing (Zero Code Required)
Tracing is already enabled via the existing tracing setup. Your HTTP requests, database queries, and service calls are automatically traced.

## Detailed Implementation Guide

### Logging Deep Dive

#### Log Levels and When to Use Them

```typescript
this.logger.debug('Detailed technical info for debugging');
this.logger.log('General informational messages');
this.logger.warn('Something might be wrong but not critical');
this.logger.error('Something definitely went wrong');
this.logger.verbose('Very detailed logs (rarely used)');
```

#### Structured Logging
Always include context as the second parameter:

```typescript
// Good - structured data
this.logger.log('User login', {userId, ip, userAgent});

// Bad - string concatenation
this.logger.log(`User ${userId} logged in from ${ip}`);
```

#### Log Correlation
Logs are automatically correlated with traces via `traceId`:

```sql
-- Find all logs for a specific trace
SELECT * FROM log_entry WHERE trace_id = 'your-trace-id';
```

### Metrics Deep Dive

#### Counter Metrics (@Count)
Use for counting events:

```typescript
@Count('api_requests')
handleRequest() { }

@Count('errors')
handleError() { }

@Count('user_registrations')
registerUser() { }
```

#### Timer Metrics (@Measure)
Use for measuring duration:

```typescript
@Measure('http_response_time')
async handleHttpRequest() { }

@Measure('database_query_time')
async runDatabaseQuery() { }

@Measure('external_api_call_duration')
async callExternalApi() { }
```

#### Custom Metrics (Advanced)
For complex scenarios, use the metrics service directly:

```typescript
import {Injectable} from '@nestjs/common';
import {MetricsService} from '@sprocketbot/observability';

@Injectable()
export class ComplexService {
  constructor(private metrics: MetricsService) {}

  async complexOperation() {
    const timer = this.metrics.startTimer('complex_operation_duration');
    const gauge = this.metrics.createGauge('active_connections');
    
    try {
      gauge.set(this.connections.size);
      
      // ... your complex operation
      
      this.metrics.increment('operation_success');
    } catch (error) {
      this.metrics.increment('operation_error');
      throw error;
    } finally {
      timer.end();
    }
  }
}
```

### Labels and Dimensions

#### Metric Labels
Add labels to metrics for better filtering:

```typescript
@Count('http_requests', {method: 'GET', endpoint: '/users'})
handleGetUsers() { }

@Measure('query_duration', {database: 'postgres', table: 'users'})
async queryUsers() { }
```

#### Log Context
Add structured context to logs:

```typescript
this.logger.log('Payment processed', {
  userId,
  amount,
  currency,
  paymentMethod,
  success: true
});
```

## Common Patterns

### API Endpoint Monitoring
```typescript
@Controller('users')
export class UserController {
  @Get()
  @Count('users_list_requests', {method: 'GET'})
  @Measure('users_list_duration')
  async listUsers() {
    return this.userService.findAll();
  }

  @Post()
  @Count('users_create_requests', {method: 'POST'})
  async createUser(@Body() data: CreateUserDto) {
    this.logger.log('Creating user', {email: data.email});
    return this.userService.create(data);
  }
}
```

### Database Operation Monitoring
```typescript
@Injectable()
export class UserRepository {
  @Measure('user_find_duration', {operation: 'find'})
  async findById(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }

  @Count('user_create', {operation: 'create'})
  async create(userData) {
    this.logger.log('Creating user in database', {userId: userData.id});
    return this.db.query('INSERT INTO users ...', [userData]);
  }
}
```

### Error Monitoring
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error('Unhandled exception', {
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      type: exception?.constructor?.name
    });
    
    // Re-throw for tracing
    throw exception;
  }
}
```

## Querying Your Data

### Log Queries
```sql
-- Recent errors
SELECT * FROM log_entry 
WHERE level = 'error' 
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Logs by service
SELECT service_name, level, COUNT(*) 
FROM log_entry 
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY service_name, level;

-- Find logs for a specific trace
SELECT * FROM log_entry 
WHERE trace_id = 'abc123'
ORDER BY timestamp;
```

### Metric Queries
```sql
-- Request count by endpoint
SELECT labels->>'endpoint' as endpoint, COUNT(*) as count
FROM metric_point 
WHERE metric_name = 'http_requests'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY labels->>'endpoint';

-- Average response time
SELECT AVG(value) as avg_duration
FROM metric_point 
WHERE metric_name = 'http_response_time'
  AND timestamp > NOW() - INTERVAL '5 minutes';

-- Error rate
SELECT 
  SUM(CASE WHEN metric_name = 'errors' THEN value ELSE 0 END) as errors,
  SUM(CASE WHEN metric_name = 'requests' THEN value ELSE 0 END) as requests
FROM metric_point 
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

## Performance Best Practices

### 1. Log Sampling
For high-volume services, sample debug logs:
```typescript
if (Math.random() < 0.1) { // 10% sampling
  this.logger.debug('Detailed info', {data});
}
```

### 2. Metric Aggregation
Use counters for high-frequency events:
```typescript
// Good - single counter
@Count('requests')
handleRequest() { }

// Bad - too granular
@Count('requests_user_123_endpoint_users_method_get')
handleRequest() { }
```

### 3. Efficient Queries
Add indexes for common queries:
```sql
CREATE INDEX idx_logs_service_timestamp ON log_entry(service_name, timestamp DESC);
CREATE INDEX idx_metrics_name_time ON metric_point(metric_name, timestamp DESC);
```

## Troubleshooting

### Logs Not Appearing
1. Check logger initialization: `private logger = new Logger(ClassName.name);`
2. Verify PostgreSQL connection
3. Check log level configuration

### Metrics Not Recording
1. Ensure decorators are on methods (not constructors)
2. Check that the observability module is imported
3. Verify method is being called (add a console.log to test)

### Traces Not Correlating
1. Check that tracing is enabled in docker-compose
2. Verify traceId is being passed in context
3. Ensure all services use the same tracing configuration

## Migration from Old Analytics Service

### Before (InfluxDB):
```typescript
// Old analytics service
this.analytics.createPoint({
  name: 'user_login',
  tags: [['userId', userId]],
  ints: [['count', 1]]
});
```

### After (PostgreSQL):
```typescript
// New approach - just use logger
this.logger.log('User login', {userId});

// Or use decorator
@Count('user_login')
loginUser(userId: string) {
  // Automatically counted
}
```

## Getting Help

1. **Check the examples** in this guide
2. **Look at existing code** in the codebase
3. **Run the queries** in the troubleshooting section
4. **Ask in the team chat** for specific issues

Remember: The goal is zero-code for logs, minimal-code for metrics, and automatic tracing. Start simple and add complexity only when needed.