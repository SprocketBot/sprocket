# Observability Operator Guide: PostgreSQL-Only Architecture

## Quick Operations Reference

### Start Observability Stack
```bash
# Start all services including observability
docker-compose up -d

# Or start observability components specifically
docker-compose up -d postgres jaeger
```

### Check Health Status
```bash
# Check all services
docker-compose ps

# Check PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Check Jaeger
curl -f http://localhost:16686/api/services || echo "Jaeger not ready"
```

### Access Observability UIs
```bash
# Jaeger Tracing UI
open http://localhost:16686

# PostgreSQL (if using admin tools)
docker-compose exec postgres psql -U postgres -d sprocket_db
```

## PostgreSQL Observability Tables

### Logs Table Schema
```sql
\d logs
-- id (UUID) - Primary key
-- timestamp (TIMESTAMPTZ) - When the log was created
-- level (VARCHAR) - DEBUG, INFO, WARN, ERROR, FATAL
-- service (VARCHAR) - Which service generated the log
-- message (TEXT) - The log message
-- context (JSONB) - Additional structured data
-- trace_id (VARCHAR) - For distributed tracing correlation
-- span_id (VARCHAR) - For distributed tracing correlation
-- created_at (TIMESTAMPTZ) - Record creation time
```

### Metrics Table Schema
```sql
\d metrics
-- id (UUID) - Primary key
-- timestamp (TIMESTAMPTIMESTAMPTZ) - When the metric was recorded
-- service (VARCHAR) - Which service recorded the metric
-- metric_name (VARCHAR) - Name of the metric
-- metric_value (NUMERIC) - The metric value
-- metric_type (VARCHAR) - counter, gauge, histogram
-- tags (JSONB) - Additional labels/dimensions
-- created_at (TIMESTAMPTZ) - Record creation time
```

## Common Operational Tasks

### Monitor Service Health
```sql
-- Check recent activity by service
SELECT 
  service,
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level = 'ERROR') as error_count,
  MAX(timestamp) as last_activity
FROM logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service
ORDER BY last_activity DESC;

-- Service health check (should have recent logs)
SELECT service, MAX(timestamp) as last_seen
FROM logs 
WHERE timestamp > NOW() - INTERVAL '5 minutes'
GROUP BY service;
```

### Monitor Error Rates
```sql
-- Error rate by service (last 24 hours)
SELECT 
  service,
  ROUND(
    COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / COUNT(*), 
    2
  ) as error_rate_pct,
  COUNT(*) FILTER (WHERE level = 'ERROR') as error_count,
  COUNT(*) as total_count
FROM logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY service
ORDER BY error_rate_pct DESC;

-- Recent errors with context
SELECT 
  timestamp,
  service,
  message,
  context->>'error' as error_details,
  trace_id
FROM logs 
WHERE level = 'ERROR' 
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC
LIMIT 50;
```

### Monitor Performance Metrics
```sql
-- Request rate over time (requests per minute)
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  SUM(metric_value) FILTER (WHERE metric_name = 'request_count') as requests_per_minute
FROM metrics 
WHERE metric_name = 'request_count'
  AND timestamp > NOW() - INTERVAL '2 hours'
GROUP BY time_bucket
ORDER BY time_bucket DESC
LIMIT 120; -- Last 2 hours

-- Response time percentiles
SELECT 
  percentile_cont(0.50) WITHIN GROUP (ORDER BY metric_value) as p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY metric_value) as p99
FROM metrics 
WHERE metric_name = 'request_duration_seconds'
  AND timestamp > NOW() - INTERVAL '1 hour';

-- Top slowest endpoints
SELECT 
  tags->>'endpoint' as endpoint,
  AVG(metric_value) as avg_duration,
  MAX(metric_value) as max_duration,
  COUNT(*) as request_count
FROM metrics 
WHERE metric_name = 'request_duration_seconds'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY tags->>'endpoint'
ORDER BY avg_duration DESC
LIMIT 20;
```

### Check Trace Correlation
```sql
-- Find logs associated with a specific trace
SELECT 
  timestamp,
  service,
  level,
  message,
  context
FROM logs 
WHERE trace_id = 'your-trace-id-here'
ORDER BY timestamp;

-- Find distributed traces across services
SELECT DISTINCT 
  trace_id,
  COUNT(*) as log_count,
  array_agg(DISTINCT service) as services_involved,
  MIN(timestamp) as trace_start,
  MAX(timestamp) as trace_end
FROM logs 
WHERE trace_id IS NOT NULL
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY trace_id
HAVING COUNT(*) > 1
ORDER BY trace_start DESC
LIMIT 20;
```

## Troubleshooting Common Issues

### No Data Appearing

**Check PostgreSQL Connection:**
```bash
# Test database connectivity
docker-compose exec postgres pg_isready -U postgres -h localhost

# Check if tables exist
docker-compose exec postgres psql -U postgres -d sprocket_db -c "\dt logs metrics"
```

**Check Application Logs:**
```bash
# Check if services are logging
docker-compose logs your-service | grep -i "observability\|log\|metric"

# Check for database errors
docker-compose logs your-service | grep -i "database\|postgres\|connection"
```

### High Database Load

**Check Active Queries:**
```bash
# See currently running queries
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
  FROM pg_stat_activity 
  WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds';"
```

**Check Table Sizes:**
```bash
# Check table sizes
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables 
  WHERE tablename IN ('logs', 'metrics')
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Jaeger Issues

**Check Jaeger Status:**
```bash
# Check if Jaeger is running
docker-compose ps | grep jaeger

# Check Jaeger logs
docker-compose logs jaeger

# Test Jaeger API
curl http://localhost:16686/api/services
```

**Check Trace Collection:**
```bash
# Check if traces are being collected
curl http://localhost:16686/api/traces?service=your-service&limit=10
```

## Data Management

### Cleanup Old Data
```bash
# Manual cleanup of old logs (older than 30 days)
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';"

# Manual cleanup of old metrics (older than 90 days)  
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '90 days';"

# Vacuum to reclaim space
docker-compose exec postgres psql -U postgres -d sprocket_db -c "VACUUM ANALYZE logs, metrics;"
```

### Automated Cleanup
```sql
-- Create cleanup function (run once)
CREATE OR REPLACE FUNCTION cleanup_observability_data() RETURNS void AS $$
BEGIN
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  VACUUM ANALYZE logs, metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup (if pg_cron is available)
SELECT cron.schedule('observability-cleanup', '0 2 * * *', 'SELECT cleanup_observability_data();');
```

### Backup Observability Data
```bash
# Backup logs table
docker-compose exec postgres pg_dump -U postgres -d sprocket_db -t logs > logs_backup.sql

# Backup metrics table  
docker-compose exec postgres pg_dump -U postgres -d sprocket_db -t metrics > metrics_backup.sql

# Backup both tables together
docker-compose exec postgres pg_dump -U postgres -d sprocket_db -t logs -t metrics > observability_backup.sql
```

### Restore Observability Data
```bash
# Restore from backup
docker-compose exec -i postgres psql -U postgres -d sprocket_db < observability_backup.sql
```

## Performance Optimization

### Index Management
```sql
-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('logs', 'metrics');

-- Add missing indexes if needed
CREATE INDEX CONCURRENTLY idx_logs_timestamp_service ON logs(timestamp DESC, service);
CREATE INDEX CONCURRENTLY idx_metrics_timestamp_name ON metrics(timestamp DESC, metric_name);
```

### Query Performance
```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM logs 
WHERE service = 'matchmaking' 
  AND timestamp > NOW() - INTERVAL '1 hour';

-- Update statistics
ANALYZE logs, metrics;
```

## Monitoring and Alerting

### Health Check Queries
```sql
-- Service health (should have recent activity)
WITH service_health AS (
  SELECT 
    service,
    MAX(timestamp) as last_seen,
    CASE 
      WHEN MAX(timestamp) > NOW() - INTERVAL '5 minutes' THEN 'HEALTHY'
      ELSE 'UNHEALTHY'
    END as status
  FROM logs 
  GROUP BY service
)
SELECT * FROM service_health ORDER BY status, service;
```

### Alert Queries
```sql
-- High error rate alert (> 5% in last hour)
SELECT 
  service,
  ROUND(
    COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / COUNT(*), 
    2
  ) as error_rate_pct
FROM logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service
HAVING COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / COUNT(*) > 5;

-- Missing metrics alert (no metrics in 10 minutes)
SELECT service, MAX(timestamp) as last_metric
FROM metrics 
GROUP BY service
HAVING MAX(timestamp) < NOW() - INTERVAL '10 minutes';
```

## Operational Commands Reference

### Database Operations
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d sprocket_db

# Check table sizes
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
  FROM pg_tables 
  WHERE tablename IN ('logs', 'metrics');"

# Reset observability data (DANGEROUS)
docker-compose exec postgres psql -U postgres -d sprocket_db -c "TRUNCATE logs, metrics;"
```

### Service Operations
```bash
# Restart observability components
docker-compose restart postgres jaeger

# View logs
docker-compose logs -f --tail=100 postgres
docker-compose logs -f --tail=100 jaeger

# Scale if needed (though single instances are usually sufficient)
docker-compose up -d --scale jaeger=1 --scale postgres=1
```

## Maintenance Schedule

### Daily
- [ ] Check service health via health check queries
- [ ] Monitor error rates for anomalies
- [ ] Verify data is flowing (recent timestamps)

### Weekly
- [ ] Review disk usage by observability tables
- [ ] Check query performance for common operations
- [ ] Validate backup procedures

### Monthly
- [ ] Review and adjust retention policies if needed
- [ ] Analyze query patterns for optimization
- [ ] Test restore procedures

## Emergency Procedures

### Database Full
```bash
# Check disk usage
docker system df

# Emergency cleanup (keeps last 7 days)
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '7 days';
  DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '7 days';
  VACUUM FULL logs, metrics;"
```

### Performance Degradation
```bash
# Check for locks
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocked_activity.usename AS blocked_user,
         blocking_locks.pid AS blocking_pid,
         blocking_activity.usename AS blocking_user,
         blocked_activity.query AS blocked_statement,
         blocking_activity.query AS current_statement_in_blocking_process
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
  WHERE NOT blocked_locks.granted;"
```

### Service Recovery
```bash
# Restart individual components
docker-compose restart postgres
docker-compose restart jaeger

# Full observability stack restart
docker-compose down postgres jaeger
docker-compose up -d postgres jaeger

# Check recovery
docker-compose ps | grep -E "(postgres|jaeger)"
```

This operator guide provides everything needed to manage the PostgreSQL-only observability infrastructure in production.