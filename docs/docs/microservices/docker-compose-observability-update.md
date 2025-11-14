# Docker Compose Observability Update: PostgreSQL-Only Architecture

## Overview

This document provides the complete Docker Compose configuration for the PostgreSQL-only observability architecture, replacing the current InfluxDB + RabbitMQ setup with PostgreSQL + Jaeger.

## Complete docker-compose.yaml Configuration

```yaml
version: '3.8'

services:
  # PostgreSQL (Enhanced for Observability)
  postgres:
    image: postgres:15-alpine
    container_name: sprocket-postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/init-observability.sql:/docker-entrypoint-initdb.d/20-observability.sql:ro
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-sprocket_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    networks:
      - sprocket-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-sprocket_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  # Jaeger (Single Container for Traces)
  jaeger:
    image: jaegertracing/all-in-one:1.50
    container_name: sprocket-jaeger
    ports:
      - "16686:16686"  # Jaeger UI
      - "4317:4317"    # OTLP gRPC
      - "4318:4318"    # OTLP HTTP
      - "14250:14250"  # gRPC
      - "14268:14268"  # HTTP
      - "9411:9411"    # Zipkin compatible
    environment:
      COLLECTOR_OTLP_ENABLED: "true"
      COLLECTOR_ZIPKIN_HOST_PORT: ":9411"
      SPAN_STORAGE_TYPE: "memory"  # For development, use "elasticsearch" for production
      MEMORY_MAX_TRACES: "100000"
    networks:
      - sprocket-network
    volumes:
      - jaeger_data:/tmp
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:16686/"]
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy

  # Core Service (With Observability)
  core:
    build: 
      context: ./core
      dockerfile: Dockerfile
    container_name: sprocket-core
    ports:
      - "3000:3000"
    volumes:
      - ./core:/app:ro
      - /app/node_modules
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-sprocket_db}
      JAEGER_ENDPOINT: http://jaeger:4317
      ENABLE_TRACING: "true"
      ENABLE_METRICS: "true"
      ENABLE_LOGS: "true"
      NODE_ENV: ${NODE_ENV:-development}
    networks:
      - sprocket-network
    depends_on:
      postgres:
        condition: service_healthy
      jaeger:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped

  # Notifications Service (Updated for PostgreSQL Events)
  notifications:
    build: 
      context: ./microservices/notifications-service
      dockerfile: Dockerfile
    container_name: sprocket-notifications
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-sprocket_db}
      JAEGER_ENDPOINT: http://jaeger:4317
      ENABLE_TRACING: "true"
      ENABLE_METRICS: "true"
      ENABLE_LOGS: "true"
      DISCORD_TOKEN: ${DISCORD_TOKEN}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    networks:
      - sprocket-network
    depends_on:
      postgres:
        condition: service_healthy
      jaeger:
        condition: service_healthy
    restart: unless-stopped

  # Image Generation Service (Updated)
  image-generation:
    build: 
      context: ./microservices/image-generation-service
      dockerfile: Dockerfile
    container_name: sprocket-image-generation
    volumes:
      - ./storage/images:/app/images
      - ./storage/generated:/app/generated
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-sprocket_db}
      JAEGER_ENDPOINT: http://jaeger:4317
      ENABLE_TRACING: "true"
      ENABLE_METRICS: "true"
      ENABLE_LOGS: "true"
      STORAGE_BACKEND: ${STORAGE_BACKEND:-local}
      S3_BUCKET: ${S3_BUCKET}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    networks:
      - sprocket-network
    depends_on:
      postgres:
        condition: service_healthy
      jaeger:
        condition: service_healthy
    restart: unless-stopped

  # Replay Parse Service (Updated)
  replay-parse:
    build: 
      context: ./microservices/replay-parse-service
      dockerfile: Dockerfile
    container_name: sprocket-replay-parse
    volumes:
      - ./storage/replays:/app/replays
      - ./storage/parsed:/app/parsed
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-sprocket_db}
      JAEGER_ENDPOINT: http://jaeger:4317
      ENABLE_TRACING: "true"
      ENABLE_METRICS: "true"
      ENABLE_LOGS: "true"
      MAX_CONCURRENT_PARSING: "4"
      PARSING_TIMEOUT_SECONDS: "300"
    networks:
      - sprocket-network
    depends_on:
      postgres:
        condition: service_healthy
      jaeger:
        condition: service_healthy
    restart: unless-stopped

  # Web Client
  web:
    build:
      context: ./clients/web
      dockerfile: Dockerfile
      target: production
    container_name: sprocket-web
    ports:
      - "5173:5173"
    volumes:
      - ./clients/web:/app:ro
      - /app/node_modules
    environment:
      PUBLIC_API_URL: ${PUBLIC_API_URL:-http://localhost:3000}
      NODE_ENV: ${NODE_ENV:-development}
    networks:
      - sprocket-network
    depends_on:
      core:
        condition: service_healthy
    restart: unless-stopped

networks:
  sprocket-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
    driver: local
  jaeger_data:
    driver: local
```

## PostgreSQL Configuration Files

### config/postgres/init-observability.sql
```sql
-- Initialize observability tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create observability schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS observability;

-- Logs table for structured logging
CREATE TABLE IF NOT EXISTS observability.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE IF NOT EXISTS observability.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON observability.logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_service ON observability.logs(service);
CREATE INDEX IF NOT EXISTS idx_logs_level ON observability.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON observability.logs(trace_id) WHERE trace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON observability.metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_service ON observability.metrics(service);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON observability.metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp_service ON observability.metrics(timestamp DESC, service);

-- Cleanup function for old data
CREATE OR REPLACE FUNCTION observability.cleanup_old_data() RETURNS void AS $$
BEGIN
  DELETE FROM observability.logs WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM observability.metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  VACUUM ANALYZE observability.logs, observability.metrics;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to application user
GRANT USAGE ON SCHEMA observability TO ${POSTGRES_USER:-postgres};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA observability TO ${POSTGRES_USER:-postgres};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA observability TO ${POSTGRES_USER:-postgres};

-- Create cleanup job (if pg_cron is available)
-- SELECT cron.schedule('observability-cleanup', '0 2 * * *', 'SELECT observability.cleanup_old_data();');
```

### config/postgres/postgresql.conf
```conf
# PostgreSQL Configuration for Observability
# Memory settings for better performance
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging for observability debugging
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Extensions
shared_preload_libraries = 'pg_stat_statements'

# Statement statistics
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

## Environment Variables Configuration

### .env.example (Observability Section)
```bash
# Observability Configuration
ENABLE_TRACING=true
ENABLE_METRICS=true
ENABLE_LOGS=true

# Jaeger Configuration
JAEGER_ENDPOINT=http://jaeger:4317
JAEGER_UI_PORT=16686

# PostgreSQL Configuration
POSTGRES_DB=sprocket_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Data Retention (days)
LOGS_RETENTION_DAYS=30
METRICS_RETENTION_DAYS=90
TRACES_RETENTION_DAYS=7

# Performance Settings
MAX_LOG_BATCH_SIZE=1000
METRICS_FLUSH_INTERVAL=1000
TRACE_SAMPLE_RATE=1.0
```

## Migration Commands

### From InfluxDB/RabbitMQ to PostgreSQL/Jaeger

```bash
# 1. Backup current setup
cp docker-compose.yaml docker-compose.yaml.backup

# 2. Update docker-compose.yaml with new configuration
# (Copy the configuration above)

# 3. Create PostgreSQL initialization script
mkdir -p config/postgres
# Copy the init-observability.sql content to config/postgres/init-observability.sql

# 4. Create PostgreSQL configuration
# Copy the postgresql.conf content to config/postgres/postgresql.conf

# 5. Start new infrastructure
docker-compose down
docker-compose up -d postgres jaeger

# 6. Wait for services to be healthy
docker-compose ps

# 7. Verify observability setup
docker-compose exec postgres psql -U postgres -d sprocket_db -c "\dt observability.*"

# 8. Start application services
docker-compose up -d
```

### Verification Commands

```bash
# Check all services are running
docker-compose ps

# Check PostgreSQL observability tables
docker-compose exec postgres psql -U postgres -d sprocket_db -c "\dt observability.*"

# Check Jaeger is accessible
curl http://localhost:16686/api/services

# Check logs are being stored
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT COUNT(*) FROM observability.logs WHERE timestamp > NOW() - INTERVAL '5 minutes';"

# Check metrics are being stored
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT COUNT(*) FROM observability.metrics WHERE timestamp > NOW() - INTERVAL '5 minutes';"

# Check trace correlation
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT COUNT(DISTINCT trace_id) FROM observability.logs WHERE trace_id IS NOT NULL AND timestamp > NOW() - INTERVAL '5 minutes';"
```

## Performance Tuning

### PostgreSQL Optimization
```bash
# Check PostgreSQL performance
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT schemaname, tablename, n_tup_ins as inserts, n_tup_upd as updates, n_tup_del as deletes
  FROM pg_stat_user_tables 
  WHERE tablename IN ('logs', 'metrics');"

# Update table statistics
docker-compose exec postgres psql -U postgres -d sprocket_db -c "ANALYZE observability.logs, observability.metrics;"
```

### Jaeger Optimization
```yaml
# For production, consider these Jaeger settings
jaeger:
  environment:
    SPAN_STORAGE_TYPE: "elasticsearch"  # Use Elasticsearch for production
    ES_SERVER_URLS: "http://elasticsearch:9200"
    ES_USERNAME: "${ELASTICSEARCH_USER}"
    ES_PASSWORD: "${ELASTICSEARCH_PASSWORD}"
    MEMORY_MAX_TRACES: "1000000"
    COLLECTOR_QUEUE_SIZE: "10000"
```

## Monitoring and Alerting

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

echo "=== Observability Health Check ==="

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U postgres -d sprocket_db > /dev/null 2>&1; then
  echo "✅ PostgreSQL is healthy"
else
  echo "❌ PostgreSQL is not responding"
fi

# Check Jaeger
if curl -f http://localhost:16686/api/services > /dev/null 2>&1; then
  echo "✅ Jaeger is healthy"
else
  echo "❌ Jaeger is not responding"
fi

# Check recent data
RECENT_LOGS=$(docker-compose exec postgres psql -U postgres -d sprocket_db -t -c "SELECT COUNT(*) FROM observability.logs WHERE timestamp > NOW() - INTERVAL '5 minutes';" | tr -d ' ')
RECENT_METRICS=$(docker-compose exec postgres psql -U postgres -d sprocket_db -t -c "SELECT COUNT(*) FROM observability.metrics WHERE timestamp > NOW() - INTERVAL '5 minutes';" | tr -d ' ')

if [ "$RECENT_LOGS" -gt 0 ]; then
  echo "✅ Logs are flowing ($RECENT_LOGS entries in last 5 minutes)"
else
  echo "⚠️  No recent logs detected"
fi

if [ "$RECENT_METRICS" -gt 0 ]; then
  echo "✅ Metrics are flowing ($RECENT_METRICS entries in last 5 minutes)"
else
  echo "⚠️  No recent metrics detected"
fi

echo "=== Health Check Complete ==="
```

## Rollback Procedure

```bash
# If you need to rollback to InfluxDB/RabbitMQ
docker-compose down
git checkout HEAD -- docker-compose.yaml
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **PostgreSQL won't start**: Check the initialization script syntax
2. **Jaeger UI not accessible**: Verify port mappings and container logs
3. **No data flowing**: Check application logs for database connection errors
4. **High memory usage**: Reduce Jaeger's MEMORY_MAX_TRACES setting

### Debug Commands
```bash
# Check service logs
docker-compose logs -f --tail=100 postgres
docker-compose logs -f --tail=100 jaeger

# Check PostgreSQL configuration
docker-compose exec postgres psql -U postgres -d sprocket_db -c "SHOW ALL;" | grep -E "(shared_buffers|work_mem)"

# Check for database locks
docker-compose exec postgres psql -U postgres -d sprocket_db -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocked_activity.usename AS blocked_user,
         blocking_locks.pid AS blocking_pid,
         blocking_activity.usename AS blocking_user,
         blocked_activity.query AS blocked_statement
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
  WHERE NOT blocked_locks.granted;"
```

This configuration provides a complete PostgreSQL-only observability setup with minimal complexity and zero external dependencies beyond the single Jaeger container for traces.