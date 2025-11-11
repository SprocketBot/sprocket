# Observability Operator Guide: Single Container Management

## Quick Start (30 seconds)

### Start Everything
```bash
# Start with full observability stack
docker-compose --profile monitoring up -d

# Or start without monitoring (logs/metrics still work)
docker-compose up -d
```

### Check Status
```bash
# See all services
docker-compose ps

# Check logs
docker-compose logs -f core

# Access interfaces
echo "Grafana: http://grafana.localhost"
echo "Jaeger: http://localhost:16686"
```

## Architecture Overview

### Single Docker Compose File
The entire observability stack is managed by one `docker-compose.yaml` file. No external dependencies.

### Services Breakdown
```
Core Application Services:
├── core (main API)
├── matchmaking
├── web (frontend)
├── discord
├── postgres (database)

Monitoring Services (optional):
├── grafana (dashboards)
├── jaeger (traces) ← NEW
├── tempo (trace backend)
├── loki (logs)
└── vector (log collection)
```

## Container Resource Usage

### Minimal Setup (Required)
- **PostgreSQL**: ~200MB RAM, 1GB disk
- **Core Services**: ~100MB RAM each

### Monitoring Stack (Optional)
- **Jaeger**: ~50MB RAM, memory-only storage
- **Grafana**: ~50MB RAM
- **Loki**: ~100MB RAM
- **Vector**: ~50MB RAM

Total additional overhead: ~250MB RAM when monitoring profile is enabled.

## Configuration Management

### Environment Variables
Create a `.env` file in the root directory:
```bash
# Core application
CORE_URL=api.localhost
BASE_URL=localhost
GRAFANA_URL=grafana.localhost

# Optional: Monitoring configuration
JAEGER_STORAGE_MAX_TRACES=10000
LOG_RETENTION_DAYS=7
METRIC_RETENTION_DAYS=30
```

### Service Configuration
All services read from `config.yaml` in the root:
```yaml
observability:
  logging:
    level: info
    retention_days: 7
  
  metrics:
    retention_days: 30
    aggregation_interval: 1m
  
  tracing:
    enabled: true
    sampling_rate: 0.1
```

## Operational Commands

### Daily Operations

```bash
# Start everything
docker-compose --profile monitoring up -d

# Stop everything
docker-compose down

# Restart a specific service
docker-compose restart core

# View logs for a service
docker-compose logs -f core

# View all logs
docker-compose logs -f

# Check service health
docker-compose ps

# Access service shell
docker-compose exec core sh
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d postgres

# Backup database
docker-compose exec postgres pg_dump -U postgres postgres > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres < backup.sql

# Check database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

### Log Management

```bash
# View recent logs
docker-compose logs --tail=100 core

# Follow logs in real-time
docker-compose logs -f core

# View logs since specific time
docker-compose logs --since=2025-11-11T10:00:00 core

# View logs with timestamps
docker-compose logs -t core
```

## Monitoring Queries

### Log Analysis
```sql
-- Connect to database
docker-compose exec postgres psql -U postgres -d postgres

-- Recent errors by service
SELECT service_name, COUNT(*) as error_count
FROM log_entry 
WHERE level = 'error' 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service_name
ORDER BY error_count DESC;

-- Error rate trend
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  COUNT(*) FILTER (WHERE level = 'error') as errors,
  COUNT(*) as total
FROM log_entry 
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY minute
ORDER BY minute DESC
LIMIT 100;
```

### Metrics Analysis
```sql
-- Request rate by service
SELECT 
  service_name,
  COUNT(*) as request_count,
  AVG(value) as avg_duration
FROM metric_point 
WHERE metric_name = 'http_request_duration'
  AND timestamp > NOW() - INTERVAL '5 minutes'
GROUP BY service_name;

-- Memory usage by service
SELECT 
  service_name,
  AVG(value) as avg_memory,
  MAX(value) as peak_memory
FROM metric_point 
WHERE metric_name = 'memory_usage_bytes'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service_name;
```

### Trace Analysis (Jaeger)
Access Jaeger UI at `http://localhost:16686` to:
- Search traces by service, operation, or tags
- View trace timelines and dependencies
- Analyze performance bottlenecks

## Troubleshooting

### Service Won't Start
```bash
# Check service logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Check port conflicts
netstat -tlnp | grep :3000

# Restart with more verbose logging
docker-compose restart <service-name>
docker-compose logs -f <service-name>
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U postgres

# Check connection from core
docker-compose exec core sh -c "PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -c 'SELECT 1'"

# Reset database (DESTRUCTIVE)
docker-compose down
docker volume rm sprocket_postgres_data
docker-compose up -d postgres
```

### High Memory Usage
```bash
# Check memory usage
docker stats

# Find large containers
docker system df

# Clean up unused resources
docker system prune -f

# Restart services with memory limits
docker-compose restart
```

### Log Storage Issues
```bash
# Check log sizes
docker system df

# Clean up logs
docker system prune -f --volumes

# Truncate specific service logs
docker-compose exec <service-name> sh -c "truncate -s 0 /var/log/*.log"
```

## Performance Tuning

### PostgreSQL Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_logs_service_time ON log_entry(service_name, timestamp DESC);
CREATE INDEX idx_metrics_name_time ON metric_point(metric_name, timestamp DESC);

-- Update statistics
ANALYZE log_entry;
ANALYZE metric_point;

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM log_entry WHERE service_name = 'core' ORDER BY timestamp DESC LIMIT 100;
```

### Retention Policies
```sql
-- Clean up old logs (run weekly)
DELETE FROM log_entry WHERE timestamp < NOW() - INTERVAL '7 days';

-- Clean up old metrics (run daily)
DELETE FROM metric_point WHERE timestamp < NOW() - INTERVAL '30 days';

-- Vacuum to reclaim space
VACUUM FULL;
```

## Backup and Recovery

### Automated Backups
Create a backup script `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sprocket_backup_${DATE}.sql"

# Create backup
docker-compose exec -T postgres pg_dump -U postgres postgres > "${BACKUP_FILE}"

# Compress
gzip "${BACKUP_FILE}"

# Keep only last 7 days of backups
find . -name "sprocket_backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: ${BACKUP_FILE}.gz"
```

### Recovery
```bash
# Stop services
docker-compose down

# Restore from backup
gunzip sprocket_backup_20251111_120000.sql.gz
docker-compose exec -T postgres psql -U postgres < sprocket_backup_20251111_120000.sql

# Start services
docker-compose up -d
```

## Security Considerations

### Network Security
- All services communicate via Docker networks
- No external ports exposed by default
- Traefik handles SSL termination

### Data Security
- PostgreSQL uses password authentication
- No sensitive data in logs by default
- Trace data doesn't include request bodies

### Access Control
- Grafana: Anonymous access enabled for simplicity
- Jaeger: No authentication (internal network only)
- PostgreSQL: Internal network only

## Scaling Considerations

### Single Machine Limits
- Recommended max: ~10 services
- PostgreSQL: 100GB database size
- Memory: 8GB total system memory

### When to Scale Beyond Single Compose
- Database size > 100GB
- Services > 10
- Request rate > 1000 req/sec
- Need for high availability

## Maintenance Schedule

### Daily
- Check service health: `docker-compose ps`
- Monitor disk usage: `docker system df`
- Review error logs

### Weekly
- Clean up old logs and metrics
- Update container images
- Review performance metrics

### Monthly
- Full database backup
- Review retention policies
- Check for unused resources

## Quick Reference

### Essential Commands
```bash
docker-compose up -d                    # Start all services
docker-compose --profile monitoring up -d  # Start with monitoring
docker-compose ps                        # Check service status
docker-compose logs -f <service>          # View logs
docker-compose restart <service>          # Restart service
docker-compose down                      # Stop all services
```

### Useful URLs
- Application: `http://localhost`
- API: `http://api.localhost`
- Grafana: `http://grafana.localhost`
- Jaeger: `http://localhost:16686`

### File Locations
- Configuration: `./config.yaml`
- Environment: `./.env`
- Docker Compose: `./docker-compose.yaml`
- Logs: Access via `docker-compose logs`

Remember: This entire observability stack runs from a single docker-compose.yaml file. No external dependencies, no complex setup, no configuration management systems. Just Docker and one configuration file.