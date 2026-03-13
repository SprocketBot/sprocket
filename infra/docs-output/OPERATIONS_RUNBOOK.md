# Sprocket Infrastructure Operations Runbook

**Version**: 1.1
**Last Updated**: December 4, 2025
**Audience**: Operations Team, DevOps Engineers

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Service Management](#service-management)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Backup & Recovery](#backup--recovery)
5. [Scaling Operations](#scaling-operations)
6. [Security Operations](#security-operations)
7. [Incident Response](#incident-response)
8. [Maintenance Procedures](#maintenance-procedures)
9. [Common Tasks](#common-tasks)
10. [Emergency Contacts](#emergency-contacts)

---

## Daily Operations

### Morning Health Check

**Frequency**: Every weekday morning
**Duration**: ~10 minutes
**Responsibility**: On-call engineer

#### Checklist

```bash
# 1. Check all services are running
docker service ls

# All services should show N/N replicas (e.g., 1/1, 3/3)
# If any show 0/N or X/N (where X < N), investigate

# 2. Check system resources
docker node ls
docker stats --no-stream

# CPU/Memory should be < 80% on average
# If consistently high, consider scaling

# 3. Run health check script
./quick-test.sh

# Should show all green checks

# 4. Check recent errors
docker service logs traefik --since 24h | grep -i error | wc -l
docker service logs prod-sprocket-core-service --since 24h | grep -i error | head -20

# Review any ERROR level logs

# 5. Check Gatus dashboard
# Navigate to https://gatus.sprocket.mlesports.gg
# All services should be "UP"

# 6. Check Grafana dashboards
# Navigate to https://grafana.sprocket.mlesports.gg
# Review key metrics:
# - Request rate
# - Error rate
# - Response times
# - Database connections
```

#### Normal vs Abnormal Examples

**✅ NORMAL - All Services Running**
```
$ docker service ls
ID             NAME                              MODE         REPLICAS   IMAGE
abc123def456   prod-sprocket-web-service         replicated   1/1        asaxplayinghorse/sprocket-web:main
bcd234efg567   prod-sprocket-core-service        replicated   1/1        asaxplayinghorse/sprocket-core:main
cde345fgh678   prod-discord-bot-service          replicated   1/1        asaxplayinghorse/sprocket-discord-bot:main
def456ghi789   layer2redis-redis-primary         replicated   1/1        redis:6-alpine
efg567hij890   rabbitmq-service                  replicated   1/1        rabbitmq:3-management

(All showing N/N replicas = healthy)
```

**❌ ABNORMAL - Service Not Running**
```
$ docker service ls
ID             NAME                              MODE         REPLICAS   IMAGE
abc123def456   prod-sprocket-web-service         replicated   0/1        asaxplayinghorse/sprocket-web:main
                                                              ^^^--- PROBLEM: Service has 0/1 replicas

Action required: Check logs with `docker service logs prod-sprocket-web-service --tail 100`
```

**✅ NORMAL - System Resources**
```
$ docker stats --no-stream
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
sprocket-web        2.5%      450MiB / 8GiB        5.62%     1.2MB / 3.4MB
sprocket-core       5.3%      680MiB / 8GiB        8.50%     4.5MB / 12MB
redis               0.8%      120MiB / 8GiB        1.50%     500KB / 800KB
postgres            3.2%      400MiB / 8GiB        5.00%     2MB / 5MB

(All containers <10% CPU, <15% Memory = healthy)
```

**❌ ABNORMAL - High Resource Usage**
```
$ docker stats --no-stream
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
sprocket-core       95.2%     7.2GiB / 8GiB        90.0%
                    ^^^^      ^^^^^^^^^^^^        ^^^^--- PROBLEM: Near memory limit
                    High CPU usage

Possible causes:
- Memory leak (check for gradual growth over time in Grafana)
- Traffic spike (check request rate in Grafana)
- Inefficient query (check slow query logs)
- Infinite loop or runaway process

Action: Check logs, review Grafana metrics, consider restarting service if unresponsive
```

**✅ NORMAL - Error Logs**
```
$ docker service logs prod-sprocket-core-service --since 24h | grep -i error
2025-11-08T10:23:15Z WARN: Retry attempt 1 for external API call
2025-11-08T11:45:32Z WARN: User authentication failed (invalid token)
2025-11-08T13:12:08Z INFO: Error handled gracefully, returned 400 to client

(Occasional warnings and handled errors = normal)
(Total count <50 errors/day = healthy)
```

**❌ ABNORMAL - High Error Rate**
```
$ docker service logs prod-sprocket-core-service --since 24h | grep -i error | wc -l
2847
^^^^--- PROBLEM: 2,847 errors in 24 hours (should be <50)

$ docker service logs prod-sprocket-core-service --since 1h | grep -i error | head -5
2025-11-08T14:01:23Z ERROR: Database connection timeout
2025-11-08T14:01:25Z ERROR: Database connection timeout
2025-11-08T14:01:27Z ERROR: Database connection timeout
2025-11-08T14:01:29Z ERROR: Database connection timeout
2025-11-08T14:01:31Z ERROR: Database connection timeout
                              ^^^--- PROBLEM: Repeated database errors

Action: Check database connectivity and health immediately
```

**✅ NORMAL - Gatus Dashboard**
```
Service Status Dashboard (https://gatus.sprocket.mlesports.gg)

Sprocket Web          ✓ UP      Response: 145ms    Uptime: 99.98%
Sprocket API          ✓ UP      Response: 67ms     Uptime: 99.95%
Discord Bot           ✓ UP      Response: N/A      Uptime: 99.92%
PostgreSQL            ✓ UP      Response: 12ms     Uptime: 100%
Redis                 ✓ UP      Response: 2ms      Uptime: 99.99%

(All services UP, response times <500ms = healthy)
```

**❌ ABNORMAL - Service Down in Gatus**
```
Service Status Dashboard

Sprocket Web          ✗ DOWN    Last check: 2min ago    Uptime: 97.23%
                      ^^^^^^--- PROBLEM: Service unreachable

Sprocket API          ⚠ SLOW    Response: 5,234ms       Uptime: 99.15%
                      ^^^^^^    ^^^^^^^^^^^^^--- PROBLEM: Very slow response (should be <500ms)

Recent Failures:
- 14:23: Sprocket Web returned 502 Bad Gateway
- 14:24: Sprocket Web connection timeout
- 14:25: Sprocket API response time >5s (threshold: 1s)

Action: Immediately check service health, review logs, check upstream dependencies
```

**✅ NORMAL - Grafana Metrics**
```
Request Rate:           350 requests/min       (steady)
Error Rate:             0.2%                   (<1% = healthy)
P95 Response Time:      245ms                  (<500ms = healthy)
Database Connections:   12/100                 (well below limit)
CPU Usage:              45%                    (plenty of headroom)
Memory Usage:           4.2GB / 8GB (52%)      (healthy)
```

**❌ ABNORMAL - Grafana Metrics**
```
Request Rate:           1,850 requests/min     (normally 350) ⚠ SPIKE
Error Rate:             15.3%                  (normally <1%) ❌ HIGH
P95 Response Time:      4,523ms                (normally <500ms) ❌ SLOW
Database Connections:   98/100                 (near limit) ⚠ WARNING
CPU Usage:              92%                    (sustained high) ⚠ WARNING
Memory Usage:           7.6GB / 8GB (95%)      (near limit) ❌ CRITICAL

Pattern suggests: Traffic spike combined with performance degradation
Likely cause: DDoS attack, viral event, or system degradation
Action: Check traffic sources, implement rate limiting, scale if legitimate traffic
```

#### Expected Output

```
✓ All services running (15/15)
✓ System resources healthy (<70% utilization)
✓ No critical errors in last 24h
✓ All health checks passing
✓ Metrics within normal range
```

#### Escalation

If health check fails:
1. Check [Incident Response](#incident-response) section
2. Notify team in #infrastructure-alerts Slack channel
3. Begin investigation immediately

---

### Weekly Review

**Frequency**: Every Monday
**Duration**: ~30 minutes
**Responsibility**: Team lead

#### Checklist

- [ ] Review uptime metrics (target: 99.9%+)
- [ ] Review error rate trends
- [ ] Check disk usage (alert if >80%)
- [ ] Review database performance
- [ ] Check certificate expiration dates
- [ ] Review pending updates
- [ ] Check backup status
- [ ] Review access logs for anomalies

#### Tasks

```bash
# 1. Generate uptime report
# From Gatus dashboard: https://gatus.sprocket.mlesports.gg
# Export last 7 days uptime data

# 2. Check disk usage
docker system df
df -h

# If disk usage >80%:
# - Clean old images: docker image prune -a
# - Clean old logs: docker system prune
# - Check volume sizes: docker volume ls

# 3. Check certificate expiration
echo | openssl s_client -connect sprocket.mlesports.gg:443 -servername sprocket.mlesports.gg 2>/dev/null | openssl x509 -noout -dates

# Should show expiration >30 days in future
# Let's Encrypt auto-renews at 30 days

# 4. Check database metrics
# In Grafana: PostgreSQL dashboard
# Review:
# - Connection count
# - Query performance
# - Table sizes
# - Cache hit ratio

# 5. Check pending updates
docker images | grep -v "latest\|main"
# Review image versions, check for updates

# 6. Verify backups
# Check Digital Ocean console
# Verify daily backups are running
# Last backup should be <24 hours old
```

---

## Service Management

### Starting a Service

```bash
# Update service if stopped
docker service update --force <service-name>

# Or scale from 0 to 1
docker service scale <service-name>=1

# Wait for service to start
docker service ps <service-name>

# Check logs
docker service logs -f <service-name>
```

### Stopping a Service

```bash
# Scale to 0 (keeps service definition)
docker service scale <service-name>=0

# Or remove completely
docker service rm <service-name>

# Note: Removing requires redeployment via Pulumi
```

### Restarting a Service

```bash
# Force update (rolling restart)
docker service update --force <service-name>

# Or with zero downtime (if replicas > 1)
docker service update --force --update-parallelism 1 <service-name>

# Monitor restart
watch -n 2 "docker service ps <service-name> | head -10"
```

### Updating a Service

#### Update Image Version

```bash
cd platform

# Update image tag in Pulumi config
pulumi config set image-tag v1.2.3

# Preview changes
pulumi preview

# Apply update
pulumi up

# Monitor rollout
docker service logs -f prod-sprocket-web-service
```

#### Update Environment Variables

```bash
# Update via Pulumi config
cd platform
pulumi config set some-config-value new-value

# Or update service directly (temporary)
docker service update \
  --env-add NEW_VAR=value \
  <service-name>

# Permanent changes should go through Pulumi
```

### Rolling Back a Service

```bash
# Roll back to previous image
docker service update --rollback <service-name>

# Or via Pulumi
cd platform
pulumi stack export > backup-before-rollback.json
# Restore previous stack state
pulumi stack import < previous-backup.json
pulumi up
```

---

## Monitoring & Alerts

### Monitoring Architecture

**⚠️ Important Context**: The monitoring diagram below shows a **generic cloud monitoring pattern** using GCP services. Our actual monitoring uses **self-hosted open-source tools** on our Docker Swarm infrastructure.

![Monitoring and Alerting Architecture](./monitoring-alerting-architecture.png)

**Our Actual Monitoring Stack**:
- **Data Sources**: Docker containers (Sprocket services), system metrics (CPU, memory, disk), application logs
- **Collection**: Telegraf (metrics collector), Docker log drivers (log collection)
- **Storage**: InfluxDB (time-series metrics), Loki (log aggregation), PostgreSQL (structured data)
- **Visualization**: Grafana (dashboards and graphs)
- **Health Monitoring**: Gatus (uptime monitoring and health checks)
- **Alerts**: Grafana alerts (email, webhook) - **not yet fully configured**

The diagram represents a **future cloud-native monitoring setup** or conceptual reference. Our current implementation is fully self-hosted on our infrastructure.

### Service Level Agreements (SLAs)

**Target Performance Standards**

Our infrastructure aims to meet the following service level agreements. These targets guide our monitoring, alerting, and capacity planning decisions.

#### Availability Targets

| Service | Uptime Target | Max Downtime/Month | Max Downtime/Year |
|---------|---------------|-------------------|-------------------|
| **Web Application** | 99.9% | 43 minutes | 8.76 hours |
| **GraphQL API** | 99.9% | 43 minutes | 8.76 hours |
| **Discord Bot** | 99.5% | 3.6 hours | 43.8 hours |
| **Database (PostgreSQL)** | 99.99% | 4.3 minutes | 52.6 minutes |
| **Redis Cache** | 99.9% | 43 minutes | 8.76 hours |
| **Overall Platform** | 99.9% | 43 minutes | 8.76 hours |

**Why these targets?**
- **99.9%** (three nines): Industry standard for SaaS applications, balances reliability with cost
- **99.99%** (four nines): For managed database - Digital Ocean provides this SLA
- **99.5%** for Discord bot: Lower target acceptable as Discord integration is supplementary, not critical path

**Current Performance** (as of November 2025):
- Web Application: 99.95% (exceeding target)
- API: 99.92% (exceeding target)
- Discord Bot: 99.87% (exceeding target)
- Database: 100% (managed service)

#### Performance Targets

| Metric | Target | Warning Threshold | Critical Threshold | Notes |
|--------|--------|-------------------|-------------------|-------|
| **API Response Time (p95)** | <500ms | >800ms | >2000ms | 95% of requests should complete in <500ms |
| **API Response Time (p99)** | <1000ms | >1500ms | >3000ms | 99% of requests should complete in <1s |
| **Web Page Load Time** | <2s | >3s | >5s | First contentful paint |
| **Error Rate** | <1% | >2% | >5% | Percentage of requests returning 5xx errors |
| **Database Query Time (p95)** | <50ms | >100ms | >500ms | 95% of queries <50ms |
| **Cache Hit Rate (Redis)** | >80% | <70% | <50% | Percentage of cache hits vs. misses |

**Why these targets?**
- **500ms p95**: Industry research shows users perceive <500ms as "instant"
- **<1% error rate**: Allows for transient failures while maintaining quality
- **>80% cache hit rate**: Ensures Redis is effectively reducing database load

#### Resource Utilization Targets

| Resource | Normal Range | Warning Threshold | Critical Threshold | Action Required |
|----------|--------------|-------------------|-------------------|-----------------|
| **CPU Usage** | 30-70% | >80% sustained | >90% sustained | Scale up or optimize |
| **Memory Usage** | 40-70% | >85% | >95% | Investigate memory leaks or scale |
| **Disk Usage** | <60% | >80% | >90% | Clean up logs/images or expand storage |
| **Database Connections** | <50/100 | >80/100 | >95/100 | Optimize connection pooling or scale |
| **Network Bandwidth** | <50% | >70% | >90% | Check for DDoS or scale bandwidth |

**Why these ranges?**
- **30-70% CPU**: Leaves headroom for traffic spikes while not wasting resources
- **<50 DB connections**: Managed PostgreSQL has 100 connection limit; staying well below avoids contention
- **<60% disk**: Growth buffer; log retention and image storage can grow quickly

#### Recovery Time Targets

| Scenario | Target RTO | Target RPO | Notes |
|----------|------------|------------|-------|
| **Service Restart** | <5 minutes | 0 (no data loss) | Automated restart via Docker Swarm |
| **Layer Redeployment** | <30 minutes | 0 (no data loss) | Using Pulumi with existing state |
| **Database Restore** | <2 hours | <24 hours | From Digital Ocean automated backups |
| **Full Infrastructure Rebuild** | <6 hours | <24 hours | From scratch using docs + backups |
| **Vault Recovery** | <30 minutes | 0 (no data loss) | Unseal keys stored locally |

**RTO** (Recovery Time Objective): How long to restore service
**RPO** (Recovery Point Objective): Maximum data loss acceptable

**Why these targets?**
- **<5min service restart**: Automated health checks trigger restarts
- **<6hr full rebuild**: Documented in DEPLOYMENT_GUIDE.md, tested quarterly
- **<24hr RPO**: Daily database backups provide acceptable data loss window

#### Alert Response Targets

| Alert Severity | Response Time | Resolution Time | Escalation |
|----------------|--------------|-----------------|------------|
| **Critical** (platform down) | <15 minutes | <2 hours | Immediate: Page on-call engineer |
| **High** (degraded performance) | <30 minutes | <4 hours | Within 30min: Notify team lead |
| **Medium** (service issue) | <2 hours | <8 hours | Next business day: Review in daily standup |
| **Low** (informational) | <24 hours | <1 week | Track in backlog |

**Critical Alerts** (page immediately):
- Platform completely down
- Database unreachable
- Error rate >10%
- Multiple services down
- Security breach detected

**High Alerts** (notify within 30min):
- Single service down
- Response time >2x normal
- Error rate >5%
- Disk usage >90%
- Memory usage >95%

#### SLA Monitoring

**Weekly SLA Review**:
```bash
# Check uptime from Gatus
# Navigate to: https://gatus.sprocket.mlesports.gg
# Export uptime report for last 7 days

# Calculate current month uptime
# Target: >99.9% (43 minutes downtime budget/month)
# If <99.9%, investigate root causes
```

**Monthly SLA Report**:
- Total downtime this month
- Incidents that caused downtime
- Performance vs. targets (response times, error rates)
- Resource utilization trends
- Capacity planning recommendations

**SLA Breach Process**:
1. Document incident (when, what, why, how long)
2. Calculate impact on monthly SLA
3. Conduct post-mortem (see [Incident Response](#incident-response))
4. Identify preventive measures
5. Update runbooks/monitoring as needed

**Current SLA Status**:
```
Month: November 2025
Uptime target: 99.9% (43min downtime budget)
Current uptime: 99.95% (21min downtime)
Remaining budget: 22 minutes

✓ On track to meet SLA
```

### Key Metrics to Monitor

#### System Metrics
- **CPU Usage**: <80% average
- **Memory Usage**: <80% average
- **Disk Usage**: <80% total
- **Network I/O**: Monitor for anomalies

#### Application Metrics
- **Request Rate**: Baseline ~100 req/min
- **Error Rate**: <1% of requests
- **Response Time**: p95 <500ms, p99 <1s
- **Active Users**: Monitor trends

#### Service Health
- **Service Replicas**: All N/N
- **Container Restarts**: <3 per day per service
- **Failed Health Checks**: 0

### Accessing Monitoring Tools

#### Grafana Unified Logs and Metrics Interface

**Unified Access Point**: https://grafana.sprocket.mlesports.gg

Grafana provides a **unified interface** for both logs and metrics, consolidating monitoring into a single dashboard:

```bash
# URL: https://grafana.sprocket.mlesports.gg
# Login: admin / <password from Vault>

# Unified Interface Features:
# - Metrics: Real-time system and application metrics via InfluxDB/Telegraf
# - Logs: Centralized log aggregation via Loki
# - Correlation: View metrics and logs side-by-side for troubleshooting
# - Time-sync: Correlate events across logs and metrics with unified timeline

# Key Dashboards:
# - System Overview: Node resources, Docker stats, CPU, memory, disk
# - Application Metrics: Request rates, latencies, error rates
# - Database: PostgreSQL performance, connection pools, query times
# - Service Health: Container states, restarts, health checks
# - Logs Explorer: Query and filter logs from all services

# Log Query Examples (in Explore view):
# {service="prod-sprocket-core-service"} |= "ERROR"
# {service="traefik"} |= "404"
# {service="vault"} |~ "unseal|seal"
```

**How to Use the Unified Interface**:

1. **View Metrics**:
   - Navigate to **Dashboards** → Select dashboard
   - View real-time graphs and metrics
   - Drill down into specific time ranges

2. **Query Logs**:
   - Navigate to **Explore** (compass icon)
   - Select **Loki** as data source
   - Use LogQL queries to filter logs
   - Example: `{service="prod-sprocket-core-service"} |= "ERROR"`

3. **Correlate Logs and Metrics**:
   - In **Explore**, add multiple queries
   - Use split view to compare metrics and logs
   - Sync time ranges to correlate events
   - Click on metric spikes to see corresponding logs

4. **Common Workflows**:
   - **Debugging**: Select time range on metric graph → View corresponding logs
   - **Performance**: Compare response time metrics with error logs
   - **Capacity**: Monitor resource metrics while reviewing application logs

#### Gatus Service Monitoring

```bash
# URL: https://gatus.sprocket.mlesports.gg

# Shows:
# - Uptime percentage
# - Response times
# - Recent downtime events
# - Health check history
```

#### Digital Ocean Master Node Access for Debugging

The infrastructure runs on a single Digital Ocean Droplet that serves as the Docker Swarm master node. You can access it via the Digital Ocean UI for direct debugging:

**Access Methods**:

1. **Via Digital Ocean Console (Web-based SSH)**:
   ```bash
   # 1. Log into Digital Ocean console: https://cloud.digitalocean.com
   # 2. Navigate to: Droplets → Select your droplet (e.g., "sprocket-master-node")
   # 3. Click "Console" in the top-right (or "Access" → "Launch Droplet Console")
   # 4. Login with root or your configured user
   ```

2. **Via SSH (Direct)**:
   ```bash
   # From your local machine
   ssh root@<droplet-ip>
   # Or if using SSH keys:
   ssh -i ~/.ssh/your-key root@<droplet-ip>
   ```

**Common Debugging Tasks on the Master Node**:

**1. Check Service Health**:
```bash
# List all Docker services
docker service ls

# Check specific service status
docker service ps prod-sprocket-core-service

# View service logs
docker service logs -f prod-sprocket-core-service --tail 100

# Check resource usage
docker stats --no-stream
```

**2. Inspect Container State**:
```bash
# List running containers
docker ps

# Get container ID for a service
CONTAINER_ID=$(docker ps -q -f name=prod-sprocket-core)

# Exec into running container for debugging
docker exec -it $CONTAINER_ID sh
# Or bash if available:
docker exec -it $CONTAINER_ID bash

# Inside container, check:
env                    # Environment variables
netstat -tuln         # Network connections
ps aux                # Running processes
df -h                 # Disk usage
```

**3. Check System Resources**:
```bash
# Disk usage
df -h
du -sh /var/lib/docker/*

# Memory usage
free -h

# CPU usage
top
# Press 'q' to quit

# Docker storage
docker system df
```

**4. Network Debugging**:
```bash
# Test DNS resolution
nslookup vault.sprocket.mlesports.gg

# Test internal service connectivity
curl http://layer2redis-redis-primary:6379
curl http://rabbitmq-service:5672

# Check Docker networks
docker network ls
docker network inspect traefik-ingress
```

**5. View Docker Swarm Status**:
```bash
# Check swarm status
docker info | grep Swarm

# List nodes (should show master + workers if multi-node)
docker node ls

# View swarm tasks
docker service ps $(docker service ls -q)
```

**Security Note**: Access to the master node provides full control over the infrastructure. Only authorized personnel should have SSH access. Consider:
- Using SSH key authentication (disable password auth)
- Restricting SSH access to specific IP addresses via firewall
- Using tools like `fail2ban` to prevent brute-force attacks
- Enabling audit logging for SSH sessions

### Setting Up Alerts

#### Alert Channels

Configure in Grafana:
1. Navigate to Alerting → Notification channels
2. Add Slack, Email, or PagerDuty
3. Test notification

**Note**: Based on development conversations, alerting is not yet fully configured. This is a priority for operational readiness.

#### Conversation-Derived Alert Thresholds

From the Claude conversations, these thresholds were identified as critical:
- **Critical**: Service down, error rate >10%, certificate expiring <7 days
- **Warning**: Response time >2x normal, resource usage >85%
- **Info**: Certificate expiring <30 days, resource usage >70%

These thresholds were determined through iterative testing during the rebuild process.

#### Example Alert Rules

**High Error Rate**:
```
Alert Name: High Error Rate
Condition: Error rate > 5% for 5 minutes
Severity: Critical
Notification: #infrastructure-alerts
```

**Service Down**:
```
Alert Name: Service Unavailable
Condition: Service replicas < desired for 2 minutes
Severity: Critical
Notification: PagerDuty + #infrastructure-alerts
```

**High CPU Usage**:
```
Alert Name: High CPU Usage
Condition: CPU > 85% for 10 minutes
Severity: Warning
Notification: #infrastructure-alerts
```

---

## Backup & Recovery

### Database Backups

#### Automated Backups (Digital Ocean)

```bash
# Backups run automatically via Digital Ocean
# Frequency: Daily
# Retention: 7 days
# Time: ~2 AM UTC

# Verify backups:
# 1. Log into Digital Ocean console
# 2. Navigate to Databases → sprocketbot-postgres
# 3. Backups tab
# 4. Verify latest backup < 24 hours old
```

#### Manual Database Backup

```bash
# Create snapshot
PGPASSWORD='your-password' pg_dump \
  -h sprocketbot-postgres-...j.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb \
  -F c \
  -f backup-$(date +%Y%m%d-%H%M%S).dump

# Upload to S3
aws s3 cp backup-*.dump s3://sprocket-backups/database/ \
  --endpoint-url https://nyc3.digitaloceanspaces.com
```

#### Database Restore

```bash
# From automated backup (Digital Ocean):
# 1. Go to Digital Ocean console
# 2. Database → Backups
# 3. Select backup
# 4. Click "Restore"
# 5. Choose to restore to new cluster or existing
# 6. Wait for restore to complete (~10-30 minutes)
# 7. Update Pulumi configs with new connection details if new cluster

# From manual backup:
PGPASSWORD='your-password' pg_restore \
  -h sprocketbot-postgres-...j.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb \
  -c \
  backup-20251108-120000.dump

# Verify restore
PGPASSWORD='your-password' psql \
  -h sprocketbot-postgres-...j.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb \
  -c "SELECT COUNT(*) FROM users;"
```

### Vault Backups

#### Backup Vault Data

```bash
# Vault data is stored in S3 (Digital Ocean Spaces)
# Bucket: vault-secrets
# Path: vault_storage/

# Backup entire bucket
aws s3 sync s3://vault-secrets/ ./vault-backup-$(date +%Y%m%d)/ \
  --endpoint-url https://nyc3.digitaloceanspaces.com

# Backup unseal keys (CRITICAL!)
cp -r global/services/vault/unseal-tokens/ ~/vault-unseal-backup-$(date +%Y%m%d)/

# Store securely (encrypted, off-site)
tar -czf vault-backup-$(date +%Y%m%d).tar.gz \
  vault-backup-*/

# Encrypt
gpg -c vault-backup-$(date +%Y%m%d).tar.gz

# Upload to secure location
aws s3 cp vault-backup-$(date +%Y%m%d).tar.gz.gpg \
  s3://sprocket-secure-backups/vault/
```

#### Restore Vault

```bash
# 1. Restore S3 data
aws s3 sync ./vault-backup-20251108/ s3://vault-secrets/ \
  --endpoint-url https://nyc3.digitaloceanspaces.com

# 2. Restore unseal keys
cp -r ~/vault-unseal-backup-20251108/ global/services/vault/unseal-tokens/

# 3. Restart Vault service
docker service update --force vault-service

# 4. Vault should auto-unseal using restored keys

# 5. Verify Vault status
export VAULT_ADDR=https://vault.sprocket.mlesports.gg
export VAULT_TOKEN=$(cat global/services/vault/unseal-tokens/root_token.txt)

vault status
# Should show: Sealed: false

# 6. Verify secrets
vault kv list platform/sprocket/manual/oauth
```

### Pulumi State Backups

```bash
# Export current state (all stacks)
cd layer_1
pulumi stack export > ~/pulumi-backups/layer_1-$(date +%Y%m%d).json

cd ../layer_2
pulumi stack export > ~/pulumi-backups/layer_2-$(date +%Y%m%d).json

cd ../platform
pulumi stack export > ~/pulumi-backups/platform-$(date +%Y%m%d).json

# Backup to S3
cd ~/pulumi-backups
tar -czf pulumi-state-$(date +%Y%m%d).tar.gz *.json

aws s3 cp pulumi-state-$(date +%Y%m%d).tar.gz \
  s3://sprocket-backups/pulumi-state/
```

### Disaster Recovery Test

**Frequency**: Quarterly
**Duration**: 4-6 hours
**Responsibility**: Team lead + ops engineer

#### Procedure

1. **Prepare Test Environment**
   - Provision separate test node
   - Clone repository
   - Set up Pulumi backend access

2. **Test Database Restore**
   - Restore latest automated backup to new cluster
   - Verify data integrity
   - Test application connectivity

3. **Test Vault Restore**
   - Restore Vault S3 data to test bucket
   - Deploy Vault with test backend
   - Unseal and verify secrets

4. **Test Full Deployment**
   - Deploy Layer 1 from scratch
   - Deploy Layer 2
   - Deploy Platform
   - Verify all services working

5. **Document Results**
   - Record time to restore
   - Document issues encountered
   - Update runbook if needed

6. **Cleanup**
   - Destroy test resources
   - Delete test data

---

## Scaling Operations

### Vertical Scaling (Single Node)

#### Scale Up Node Resources

```bash
# Digital Ocean:
# 1. Power off node
# 2. Resize droplet (more CPU/RAM)
# 3. Power on node
# 4. Verify services restart

# Or with zero downtime (if multi-node):
# 1. Add new larger node to swarm
# 2. Drain old node
# 3. Remove old node
# 4. Destroy old node
```

#### When to Scale Up

- CPU consistently >70%
- Memory consistently >70%
- Disk I/O bottlenecks
- Network bandwidth saturated

### Horizontal Scaling (Multiple Nodes)

#### Add Node to Swarm

```bash
# On manager node (current node)
docker swarm join-token worker

# Output will be:
# docker swarm join --token SWMTKN-1-xxx... <manager-ip>:2377

# On new worker node
docker swarm join --token SWMTKN-1-xxx... <manager-ip>:2377

# Verify node joined
docker node ls
# Should show new node

# Label node (optional)
docker node update --label-add role=worker node-2
```

#### Scale Services Across Nodes

```bash
# Increase replicas
docker service scale prod-sprocket-web-service=3

# Service will distribute across available nodes

# Constrain service to specific nodes (optional)
docker service update \
  --constraint-add node.labels.role==worker \
  prod-sprocket-web-service

# Verify distribution
docker service ps prod-sprocket-web-service
```

#### Scaling Considerations

**Stateless Services** (can scale horizontally):
- Sprocket Web
- Sprocket API
- Discord Bot
- All microservices

**Stateful Services** (need careful planning):
- Redis (requires Redis Cluster for multi-node)
- RabbitMQ (requires clustering)
- Vault (requires HA setup with Consul/etcd)

### Auto-Scaling (Future)

Currently manual scaling only. Future improvements:
- Docker Swarm auto-scaling (via custom scripts)
- Metrics-based scaling triggers
- Load-based node addition

---

## Security Operations

### Secret Rotation

#### Rotate Database Password

```bash
# 1. Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Update Digital Ocean database
# Via console: Settings → Users → Reset Password

# 3. Update Vault
vault kv put infrastructure/data/postgres password="$NEW_PASSWORD"

# 4. Update Pulumi config
cd layer_1
pulumi config set --secret postgres-password "$NEW_PASSWORD"

# 5. Update services
cd ../platform
pulumi up

# 6. Verify connectivity
docker service logs prod-sprocket-core-service | grep -i "database connection"
```

#### Rotate Vault Root Token

```bash
# 1. Generate new root token
vault token create -policy=root

# Output:
# Key                  Value
# ---                  -----
# token                s.xxxxxxxxxxxxxx

# 2. Update environment variable
export VAULT_TOKEN=s.xxxxxxxxxxxxxx

# 3. Revoke old root token (if not the initial root token)
vault token revoke <old-token>

# 4. Store new token securely
echo "s.xxxxxxxxxxxxxx" > global/services/vault/unseal-tokens/root_token.txt

# 5. Update documentation
```

#### Rotate OAuth Credentials

```bash
# 1. Generate new credentials in provider console
# (Google Cloud Console, Discord Developer Portal, etc.)

# 2. Update Doppler
doppler secrets set GOOGLE_CLIENT_ID="new-id"
doppler secrets set GOOGLE_CLIENT_SECRET="new-secret"

# 3. Re-run bootstrap script
cd scripts
export VAULT_ADDR=https://vault.sprocket.mlesports.gg
export VAULT_TOKEN=$(cat ../global/services/vault/unseal-tokens/root_token.txt)
./bootstrap-vault-secrets.sh

# 4. Restart affected services
docker service update --force prod-sprocket-core-service
```

### Access Review

**Frequency**: Quarterly
**Responsibility**: Security lead

#### Checklist

- [ ] Review GitHub organization members
- [ ] Review Vault policies and access
- [ ] Review Doppler project access
- [ ] Review SSH key access to nodes
- [ ] Review Digital Ocean account access
- [ ] Review Pulumi backend access
- [ ] Revoke unnecessary access
- [ ] Update access documentation

### Security Scanning

```bash
# Scan Docker images for vulnerabilities
# Using Trivy (install first: https://github.com/aquasecurity/trivy)
trivy image asaxplayinghorse/sprocket-web:main

# Scan infrastructure code
# Using Checkov (install: pip install checkov)
cd layer_1
checkov -d .

# Review results and address HIGH/CRITICAL findings
```

### Certificate Management

```bash
# Check certificate expiration
echo | openssl s_client -connect sprocket.mlesports.gg:443 -servername sprocket.mlesports.gg 2>/dev/null | openssl x509 -noout -dates

# Output:
# notBefore=Oct 10 00:00:00 2025 GMT
# notAfter=Jan 8 00:00:00 2026 GMT  # Auto-renews at 30 days before

# Let's Encrypt certificates auto-renew via Traefik
# Monitor Traefik logs for renewal errors:
docker service logs traefik | grep -i "renew\|acme"

# If renewal fails:
# 1. Check DNS is correct
# 2. Check port 80 is accessible
# 3. Check Let's Encrypt rate limits
# 4. Restart Traefik: docker service update --force traefik

#### Certificate Issues from Development

Based on Claude conversations, these specific certificate issues were encountered:
- Rate limiting (50 certificates/week per domain)
- DNS propagation delays
- Certificate provisioning timing (60+ seconds per attempt)

**Recovery from Rate Limits**:
- Wait 1 hour for soft limit reset
- Use staging environment for testing
- Verify DNS before requesting production certs
```

---

## Incident Response

### Severity Levels

**P0 - Critical**:
- Complete platform outage
- Data loss/corruption
- Security breach

**P1 - High**:
- Major feature unavailable
- Significant performance degradation
- High error rates (>5%)

**P2 - Medium**:
- Minor feature unavailable
- Moderate performance issues
- Elevated error rates (1-5%)

**P3 - Low**:
- Cosmetic issues
- Non-critical bugs
- Low error rates (<1%)

### Incident Response Process

#### 1. Detection

```bash
# Incident detected via:
# - Automated alerts (Gatus, Grafana)
# - User reports
# - Monitoring dashboards
# - Health checks
```

#### 2. Triage

```bash
# Determine severity
# P0/P1: Page on-call immediately
# P2: Notify team, begin investigation
# P3: Create ticket for next business day

# Create incident channel
# Slack: #incident-YYYYMMDD-description
```

#### 3. Investigation

```bash
# Gather information
# 1. Check service status
docker service ls

# 2. Check recent logs
docker service logs --since 1h <affected-service> | tail -100

# 3. Check system resources
docker stats --no-stream

# 4. Check recent changes
cd platform
git log --since="2 hours ago" --oneline

# 5. Check external dependencies
# - Database (Digital Ocean console)
# - DNS (check propagation)
# - Network (ping, traceroute)
```

#### 4. Mitigation

**Service Down**:
```bash
# Restart service
docker service update --force <service-name>

# Or rollback recent deployment
docker service update --rollback <service-name>
```

**High Load**:
```bash
# Scale up
docker service scale <service-name>=3

# Or throttle requests (Traefik rate limiting)
# Update Traefik config to add rate limiter
```

**Database Issues**:
```bash
# Check connections
# In Digital Ocean console: Metrics → Connections

# Kill long-running queries
PGPASSWORD='pass' psql -h host -p 25060 -U doadmin -d defaultdb \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';"
```

**Certificate Expired**:
```bash
# Force cert renewal
docker service update --force traefik

# Monitor logs
docker service logs -f traefik | grep -i acme
```

#### 5. Communication

```bash
# Update status page (if exists)
# Post in #incidents channel
# Message template:
```

```
🚨 Incident Update 🚨

Incident: [P0/P1/P2] Service Unavailable
Time: YYYY-MM-DD HH:MM UTC
Status: Investigating / Mitigating / Resolved
Impact: [describe user impact]

Details:
[brief description]

Next Update: [time]
```

#### 6. Resolution

```bash
# Verify fix
./quick-test.sh

# Monitor for 30 minutes
watch -n 60 "docker service ls && docker stats --no-stream"

# Declare resolved when:
# - Service restored
# - No errors in logs
# - Metrics normal
# - User reports cleared
```

#### 7. Post-Incident Review

```markdown
# Post-Incident Report Template

## Incident Summary
- **Date**: YYYY-MM-DD
- **Duration**: X hours
- **Severity**: PX
- **Services Affected**: [list]

## Timeline
- HH:MM - Incident detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix implemented
- HH:MM - Incident resolved

## Root Cause
[Detailed explanation]

## Resolution
[How it was fixed]

## Impact
- Users affected: ~X
- Revenue impact: $X
- Downtime: X minutes

## Action Items
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]
- [ ] [Documentation update]

## Lessons Learned
[What we learned]
```

---

## Maintenance Procedures

### Updating Docker Images

```bash
# Update image tag
cd platform
pulumi config set image-tag v1.2.3

# Preview changes
pulumi preview

# Apply update (rolling)
pulumi up

# Monitor rollout
docker service ps prod-sprocket-web-service --no-trunc
docker service logs -f prod-sprocket-web-service
```

### Updating Infrastructure Code

```bash
# Pull latest code
cd sprocket-infra
git pull origin main

# Install dependencies (if changed)
cd layer_1
npm install

cd ../layer_2
npm install

cd ../platform
npm install

# Preview changes
pulumi preview

# If changes look good:
pulumi up
```

### System Updates

```bash
# Update node OS (requires downtime for single-node)
# 1. Schedule maintenance window
# 2. Notify users
# 3. Export Pulumi state (backup)
pulumi stack export > backup.json

# 4. Update OS
sudo apt update && sudo apt upgrade -y

# 5. Reboot if kernel updated
sudo reboot

# 6. Wait for node to come back

# 7. Verify Docker Swarm is active
docker info | grep Swarm

# 8. Verify services restarted
docker service ls

# 9. Run health check
./quick-test.sh
```

### Database Maintenance

```bash
# Database maintenance is handled by Digital Ocean
# They perform:
# - OS updates
# - PostgreSQL updates
# - Security patches
# - Performance tuning

# You can schedule maintenance windows in DO console:
# Database → Settings → Maintenance Window
# Recommended: Off-peak hours (2-4 AM)

# Manual maintenance tasks:

# 1. Analyze tables (improves query performance)
PGPASSWORD='pass' psql -h host -p 25060 -U doadmin -d defaultdb \
  -c "ANALYZE;"

# 2. Vacuum (reclaim storage)
PGPASSWORD='pass' psql -h host -p 25060 -U doadmin -d defaultdb \
  -c "VACUUM;"

# 3. Check table bloat
PGPASSWORD='pass' psql -h host -p 25060 -U doadmin -d defaultdb \
  -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"

#### Database Issues from Development

From Claude conversations, these specific database issues were encountered:
- Connection timeouts: Check network connectivity, firewall rules
- Too many connections: Scale connection pool, optimize queries
- Authentication failures: Verify credentials in Vault, check user permissions

**Connection Management**:
- Managed PostgreSQL has 100 connection limit
- Stay well below limit to avoid contention
- Monitor connection count in Digital Ocean console
```

---

## Common Tasks

### View Service Logs

```bash
# Tail logs
docker service logs -f <service-name>

# Tail last 100 lines
docker service logs --tail 100 <service-name>

# Since specific time
docker service logs --since 2h <service-name>

# Filter for errors
docker service logs <service-name> 2>&1 | grep -i error

# Follow multiple services
docker service logs -f \
  prod-sprocket-web-service \
  prod-sprocket-core-service
```

### Check Service Health

```bash
# Service replicas
docker service ls | grep <service-name>

# Service tasks
docker service ps <service-name>

# Service details
docker service inspect <service-name>

# Service logs
docker service logs <service-name> --tail 50
```

### Exec into Container

```bash
# Get container ID
CONTAINER_ID=$(docker ps -q -f name=<service-name>)

# Exec into container
docker exec -it $CONTAINER_ID sh

# Or bash (if available)
docker exec -it $CONTAINER_ID bash

# Common tasks in container:
# - Check environment variables: env
# - Check processes: ps aux
# - Check network: netstat -tuln
# - Check disk: df -h
# - Check files: ls -la /app
```

### Check Network Connectivity

```bash
# From node to external service
curl https://api.external.com

# From container to external service
docker exec $CONTAINER_ID curl https://api.external.com

# Between containers
docker exec $CONTAINER_ID ping <other-service-name>
docker exec $CONTAINER_ID curl http://<other-service-name>:<port>

# DNS resolution
docker exec $CONTAINER_ID nslookup <service-name>
```

### Clear Docker Resources

**Background**: Docker storage can grow significantly over time due to:
- Container layer duplication in overlay2
- Unlimited log growth from services
- Unused images and volumes
- Build cache accumulation

**Monitoring Storage**:
```bash
# Check overall Docker disk usage
docker system df

# Check detailed breakdown
docker system df -v

# Check overlay2 directory size
du -sh /var/lib/docker/overlay2

# Check system disk usage
df -h /var/lib/docker
```

**Storage Management Improvements** (implemented Nov 2025):
- Enhanced log rotation: 5MB max size, 5 files, compression enabled
- Volume size limits: Redis (2GB), MinIO (10GB), InfluxDB (5GB), Airbyte (5GB)
- Automated cleanup scripts available in repository root

**Cleanup Commands**:
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes (⚠️ CAREFUL! May delete data)
docker volume prune -f

# Remove unused networks
docker network prune -f

# All at once (recommended for routine cleanup)
docker system prune -a -f

# Check space saved
docker system df
```

**Automated Cleanup Script**:
```bash
# Use the automated cleanup script (if available)
./docker-storage-cleanup.sh

# This script:
# - Prunes all unused Docker resources
# - Analyzes overlay2 directory
# - Reports storage savings
# - Provides recommendations
```

**When to Run Cleanup**:
- Monthly maintenance (scheduled)
- When disk usage >80%
- After major deployments
- When Docker overlay2 exceeds 15GB

**Expected Results**:
- Typical cleanup: Reclaim 2-5GB
- Major cleanup (after months): Reclaim 10-18GB
- Post-cleanup overlay2: ~6-10GB (with containers running)

**RabbitMQ Connection Management** (added Nov 2025):
RabbitMQ services now include improved connection handling:
- Proper health checks to prevent connection leaks
- Connection pooling configuration
- Auto-reconnect on connection failures

If experiencing RabbitMQ connection issues:
```bash
# Check RabbitMQ service health
docker service ps rabbitmq-service

# View RabbitMQ logs
docker service logs rabbitmq-service --tail 100

# Restart RabbitMQ if needed
docker service update --force rabbitmq-service
```

---

## Emergency Contacts

### On-Call Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| TBD | Engineer 1 | Engineer 2 |
| TBD | Engineer 2 | Engineer 3 |
| TBD | Engineer 3 | Engineer 1 |

### Contact Methods

**During Business Hours** (9 AM - 5 PM):
- Slack: #infrastructure channel
- Email: infra-team@example.com

**After Hours / Emergencies**:
- PagerDuty: (if configured)
- Phone: On-call engineer
- Escalation: Team lead

### External Support

**Digital Ocean Support**:
- Priority Support: https://cloud.digitalocean.com/support
- Phone: +1 (XXX) XXX-XXXX
- Email: support@digitalocean.com

**Pulumi Support**:
- Slack: Pulumi Community
- Email: support@pulumi.com
- Docs: https://www.pulumi.com/docs/

**GitHub Support**:
- Email: support@github.com
- Status: https://www.githubstatus.com/

### Service Status Pages

- Digital Ocean: https://status.digitalocean.com/
- GitHub: https://www.githubstatus.com/
- Docker Hub: https://status.docker.com/

---

## Appendix

### Useful Commands Reference

```bash
# Docker Swarm
docker swarm init                    # Initialize swarm
docker node ls                       # List nodes
docker service ls                    # List services
docker service ps <service>          # List service tasks
docker service logs <service>        # View service logs

# Docker System
docker system df                     # Show disk usage
docker system prune                  # Clean up unused resources
docker stats                         # Show resource usage

# Pulumi
pulumi preview                       # Preview changes
pulumi up                            # Apply changes
pulumi destroy                       # Destroy resources
pulumi stack export                  # Export state
pulumi config                        # View configuration

# Vault
vault status                         # Check Vault status
vault operator unseal                # Unseal Vault
vault kv get <path>                  # Get secret
vault kv put <path> key=value        # Put secret

# PostgreSQL
psql -h <host> -p <port> -U <user> -d <db>    # Connect
pg_dump -h <host> -p <port> -U <user> -d <db> # Backup
pg_restore -h <host> -p <port> -U <user> -d <db> <file> # Restore
```

### Quick Reference URLs

- **Traefik Dashboard**: https://traefik.sprocket.mlesports.gg
- **Vault UI**: https://vault.sprocket.mlesports.gg
- **Grafana**: https://grafana.sprocket.mlesports.gg
- **Gatus**: https://gatus.sprocket.mlesports.gg
- **Sprocket Web**: https://sprocket.mlesports.gg
- **Sprocket API**: https://api.sprocket.mlesports.gg

---

**Operations Runbook Version**: 1.1
**Last Updated**: December 4, 2025
**Review Cycle**: Quarterly
**Next Review**: March 2026

---

## Troubleshooting Guide (From Development Experience)

This section contains specific solutions derived from the Claude conversation history during the infrastructure rebuild project. These are proven solutions to problems that were encountered and resolved during development.

### Vault Unsealing Issues

**Problem**: Vault shows as sealed after restart
**Root Cause**: Auto-unseal script not working or unseal keys missing
**Solution**:
```bash
# Check if unseal tokens exist
ls -la global/services/vault/unseal-tokens/

# If missing, manually unseal with stored keys
vault operator unseal
# Enter first unseal key from your secure storage

# Repeat 2 more times with different keys
vault status  # Should show "Sealed: false"
```

**Prevention**: Ensure unseal keys are backed up securely and the auto-initialization script is working.

### Multi-Environment Routing Issues

**Problem**: 404 errors when accessing via different methods (localhost, IP, domain)
**Root Cause**: Traefik routing rules not configured for all access patterns
**Solution**:
```bash
# Test each access method
curl -H "Host: sprocket.mlesports.gg" http://localhost
curl -H "Host: 192.168.4.39" http://localhost

# Check Traefik routers
docker exec traefik wget -q -O- http://localhost:8080/api/http/routers | jq
```

**Configuration**: Ensure Pulumi config includes appropriate routing rules:
```yaml
# For local development
hostname: localhost
server-ip: 192.168.4.39
tailscale-ip: 100.110.185.84

# For production (remove IP-based routing)
hostname: sprocket.mlesports.gg
```

### Service Network Connectivity

**Problem**: Services can't connect to RabbitMQ, Redis, or other Layer 2 services
**Root Cause**: Network isolation or DNS resolution issues between layers
**Solution**:
```bash
# Check service discovery from container
docker exec <service-container> nslookup layer2_rabbitmq
docker exec <service-container> ping layer2_redis

# Verify network membership
docker network inspect <network-name> | grep -A5 "Containers"

# Test connections
docker exec <service-container> curl http://layer2_rabbitmq:5672
docker exec <service-container> redis-cli -h layer2_redis ping
```

**Prevention**: Ensure all services are on the correct Docker networks and DNS resolution is working.

### Environment Variable Issues

**Problem**: JWT secrets malformed, duplicate variables, line breaks in tokens
**Root Cause**: Manual environment variable management
**Solution**: Use the bootstrap script approach:
```bash
# Bootstrap all secrets from Doppler to Vault
export VAULT_ADDR=https://vault.sprocket.mlesports.gg
export VAULT_TOKEN=<root-token>
./scripts/bootstrap-vault-secrets.sh

# Verify secrets in Vault
vault kv get platform/sprocket/manual/oauth/google
```

**Historical Context**: The `generate-env.sh` script caused ongoing issues during development, leading to the current Vault-based approach.

### Storage Migration Issues

**Problem**: S3 connectivity issues after migration from MinIO
**Root Cause**: Configuration changes or credential issues
**Solution**:
```bash
# Test S3 connectivity
aws s3 ls --endpoint-url https://nyc3.digitaloceanspaces.com

# Check Vault S3 backend
vault status  # Should show initialized: true

# Verify configuration
pulumi config get s3-endpoint
pulumi config get s3-access-key
```

**Migration Process**: The conversations revealed a phased approach:
1. Dual operation (keep MinIO, add cloud S3)
2. Migrate Vault backend to cloud S3 first
3. Migrate application services
4. Remove MinIO completely

### Certificate and HTTPS Issues

**Problem**: Let's Encrypt certificate renewal failures
**Root Cause**: Rate limiting, DNS issues, or configuration problems
**Solution**:
```bash
# Check certificate expiration
echo | openssl s_client -connect sprocket.mlesports.gg:443 -servername sprocket.mlesports.gg | openssl x509 -noout -dates

# Monitor Traefik logs
docker service logs traefik | grep -i "acme\|renew\|certificate"

# Force renewal if needed
docker service update --force traefik
```

**Known Issues from Development**:
- Rate limiting: 50 certificates/week per domain
- DNS propagation delays
- Certificate provisioning takes 60+ seconds

**Recovery**: Use staging environment for testing, wait 1 hour for rate limit reset.

### Development vs Production Differences

Based on conversations during development, key differences between dev and prod environments:

**Development Environment**:
- Uses IP-based routing (localhost, LAN IP, Tailscale IP)
- Self-signed certificates acceptable
- `/etc/hosts` modifications for local testing
- More permissive network access

**Production Environment**:
- Real domain names only
- Let's Encrypt certificates required
- Proper DNS configuration mandatory
- Stricter security controls

**Configuration Strategy**:
```yaml
# Development - multiple access patterns
hostname: localhost
server-ip: 192.168.4.39
tailscale-ip: 100.110.185.84

# Production - domain-based only
hostname: sprocket.mlesports.gg
# Remove server-ip and tailscale-ip configs
```

---

*This runbook is a living document. Please update it as procedures change or new issues are discovered.*
