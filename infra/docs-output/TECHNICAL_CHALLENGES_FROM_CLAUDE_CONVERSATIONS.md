# Technical Challenges and Solutions from Claude Conversations

**Document Type**: Operations Supplement  
**Source**: Claude conversation history analysis  
**Purpose**: Detailed technical solutions for common operational issues

---

## 1. Vault Unsealing and Automation

### Problem
Vault requires manual unsealing after each restart, creating a chicken-and-egg problem for automation:
- Services need secrets from Vault
- Vault must be unsealed to serve secrets  
- Unsealing requires unseal keys
- Where to store unseal keys securely?

### Solution Implemented
**Local Bind Mount with Auto-Initialization Script**

```bash
# File: global/services/vault/scripts/auto-initialize.sh
# Key components:
1. Check if Vault is initialized (via S3 backend state)
2. If not initialized: Run vault operator init, save tokens
3. If initialized but sealed: Read unseal keys from bind mount
4. Unseal with 3 of 5 keys
5. Vault ready to serve secrets
```

**File Structure**:
```
global/services/vault/unseal-tokens/
├── unseal_tokens.txt    # Store unseal keys
└── root_token.txt       # Store root token
```

### Operational Commands
```bash
# Check Vault status
vault status

# Manual unseal (if automation fails)
vault operator unseal <unseal-key>

# Verify tokens work
vault token lookup
```

### Troubleshooting
- **Issue**: Vault shows as sealed after restart
- **Solution**: Check `/vault/unseal-tokens/unseal_tokens.txt` exists and contains valid keys
- **Issue**: Auto-unseal fails
- **Solution**: Manually unseal, then investigate script logs

---

## 2. Multi-Environment Routing Issues

### Problem
Platform needs to be accessible via multiple patterns:
- Local development: `.localhost` domains
- LAN access: Direct IP (192.168.4.39)
- Tailscale access: Tailscale IP (100.110.185.84)
- Production: Real domain (sprocket.mlesports.gg)

### Root Cause
Traefik routes based on `Host` header, causing 404s when accessing via IP/localhost.

### Solution
**Conditional Routing Rules in TypeScript**

```typescript
// Build routing rule based on configuration
const hostRules = [];

if (hostname) {
  hostRules.push(`Host(\`${subdomain}.${hostname}\`)`);
}

if (serverIp) {
  hostRules.push(`Host(\`${serverIp}\`)`);
}

if (tailscaleIp) {
  hostRules.push(`Host(\`${tailscaleIp}\`)`);
}

const routingRule = hostRules.join(' || ');
```

### Configuration Examples

**Local Development**:
```yaml
hostname: localhost
server-ip: 192.168.4.39
tailscale-ip: 100.110.185.84
```

**Production**:
```yaml
hostname: sprocket.mlesports.gg
# Remove server-ip and tailscale-ip
```

### Operational Commands
```bash
# Test routing
curl -H "Host: sprocket.mlesports.gg" http://localhost
curl -H "Host: 192.168.4.39" http://localhost

# Check Traefik routers
docker exec traefik wget -q -O- http://localhost:8080/api/http/routers
```

---

## 3. Service Network Connectivity

### Common Issues
1. **Services can't find RabbitMQ host**
2. **Redis connection failures**
3. **Cross-layer network isolation**

### Diagnostic Commands
```bash
# Check service discovery
docker exec <service-container> nslookup layer2_rabbitmq
docker exec <service-container> ping layer2_redis

# Check network connectivity
docker network ls
docker network inspect <network-name>

# Test connections from container
docker exec <service-container> curl http://layer2_rabbitmq:5672
docker exec <service-container> redis-cli -h layer2_redis ping
```

### Solutions
1. **Ensure services are on correct networks**
2. **Verify DNS resolution works between layers**
3. **Check firewall/security group rules**

---

## 4. Environment Variable Management

### Historical Issues
From conversations:
- JWT_SECRET generation produced malformed strings
- Duplicate REDIS_PASSWORD variables
- Line breaks in tokens (INFLUX_ADMIN_TOKEN, FORWARD_AUTH_SECRET)

### Current Solution
**Bootstrap Script Approach**: `scripts/bootstrap-vault-secrets.sh`

```bash
# Environment variables → Vault → Docker secrets
# Source: Doppler or environment
# Destination: Vault paths
# Usage: Services read from Vault via Pulumi
```

### Operational Commands
```bash
# Bootstrap all secrets
export VAULT_ADDR=https://vault.sprocket.mlesports.gg
export VAULT_TOKEN=<root-token>
./scripts/bootstrap-vault-secrets.sh

# Verify secrets in Vault
vault kv get platform/sprocket/manual/oauth/google
vault kv get infrastructure/data/postgres
```

### Troubleshooting
- **Issue**: Secret not found
- **Solution**: Run bootstrap script, check Vault paths
- **Issue**: Service can't read secret
- **Solution**: Check Vault policies and service permissions

---

## 5. Storage Migration (MinIO → Cloud S3)

### Migration Process
1. **Phase 1**: Dual operation (keep MinIO, add cloud S3)
2. **Phase 2**: Migrate Vault backend to cloud S3
3. **Phase 3**: Migrate application services
4. **Phase 4**: Remove MinIO completely

### Configuration Changes
```yaml
# Before (MinIO)
s3-endpoint: minio.sprocket.mlesports.gg
s3-access-key: local-minio-key
s3-secret-key: local-minio-secret
s3-port: 9000
ssl: false

# After (Cloud S3)
s3-endpoint: nyc3.digitaloceanspaces.com
s3-access-key: DO004ZHPV38R8C9Q46XG
s3-secret-key: [from Vault]
s3-port: 443
ssl: true
```

### Verification Commands
```bash
# Test S3 connectivity
aws s3 ls --endpoint-url https://nyc3.digitaloceanspaces.com

# Check Vault S3 backend
vault status  # Should show initialized: true
```

---

## 6. Certificate and HTTPS Issues

### Let's Encrypt Challenges
- Rate limiting (50 certificates/week per domain)
- DNS propagation delays
- Certificate provisioning timing

### Operational Commands
```bash
# Check certificate expiration
echo | openssl s_client -connect sprocket.mlesports.gg:443 -servername sprocket.mlesports.gg | openssl x509 -noout -dates

# Force certificate renewal
docker service update --force traefik

# Monitor Traefik logs for ACME issues
docker service logs traefik | grep -i "acme\|renew\|certificate"
```

### Troubleshooting
- **Issue**: Certificate renewal fails
- **Solutions**:
  1. Check DNS resolution
  2. Verify port 80 accessibility
  3. Check Let's Encrypt rate limits
  4. Use staging environment for testing

---

## 7. Service Health and Debugging

### Quick Health Check
```bash
# Run comprehensive test
./quick-test.sh

# Check all services
docker service ls

# Check recent logs
docker service logs --since 1h <service-name>

# Check resource usage
docker stats --no-stream
```

### Common Service Issues

**Service Won't Start**:
```bash
# Check logs for errors
docker service logs <service-name> --tail 100

# Check configuration
docker service inspect <service-name>

# Restart service
docker service update --force <service-name>
```

**High Resource Usage**:
```bash
# Identify resource hogs
docker stats --no-stream

# Check for memory leaks
docker service logs <service-name> | grep -i "memory\|leak"

# Scale if needed
docker service scale <service-name>=3
```

**Network Issues**:
```bash
# Test connectivity
docker exec <container> ping <target-service>
docker exec <container> curl <target-url>

# Check DNS
docker exec <container> nslookup <service-name>
```

---

## 8. Database Connection Issues

### Managed PostgreSQL (Digital Ocean)
```bash
# Connect to database
PGPASSWORD='password' psql \
  -h sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb

# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query_start < now() - interval '5 minutes';
```

### Common Issues
1. **Connection timeouts**: Check network connectivity, firewall rules
2. **Too many connections**: Scale connection pool, optimize queries
3. **Authentication failures**: Verify credentials in Vault, check user permissions

---

## 9. Secret Rotation Procedures

### Database Password Rotation
```bash
# 1. Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Update Digital Ocean console
# 3. Update Vault
vault kv put infrastructure/data/postgres password="$NEW_PASSWORD"

# 4. Update Pulumi config
pulumi config set --secret postgres-password "$NEW_PASSWORD"

# 5. Redeploy affected services
pulumi up
```

### OAuth Credential Rotation
```bash
# 1. Generate new credentials in provider console
# 2. Update Doppler
doppler secrets set GOOGLE_CLIENT_ID="new-id"
doppler secrets set GOOGLE_CLIENT_SECRET="new-secret"

# 3. Re-run bootstrap
./scripts/bootstrap-vault-secrets.sh

# 4. Restart services
docker service update --force prod-sprocket-core-service
```

---

## 10. Emergency Procedures

### Complete Service Outage
```bash
# 1. Check system status
docker node ls
docker service ls

# 2. Check logs for critical errors
docker service logs traefik --since 1h | grep -i error

# 3. Restart core services
docker service update --force traefik
docker service update --force vault-service

# 4. Verify restoration
./quick-test.sh
```

### Database Recovery
```bash
# From Digital Ocean automated backup:
# 1. Console → Databases → Backups
# 2. Select backup → Restore
# 3. Update connection strings if new cluster
# 4. Verify connectivity
PGPASSWORD='pass' psql -h new-host -p 25060 -U doadmin -d defaultdb -c "SELECT 1;"
```

### Vault Recovery
```bash
# 1. Restore S3 data
aws s3 sync ./vault-backup/ s3://vault-secrets/

# 2. Restore unseal keys
cp -r ./vault-unseal-backup/ global/services/vault/unseal-tokens/

# 3. Restart Vault
docker service update --force vault-service

# 4. Verify unsealed
vault status
```

---

## Monitoring and Alerting Setup

### Key Metrics to Monitor
- Service availability (Gatus)
- Response times (Grafana)
- Error rates (application logs)
- Resource utilization (CPU, memory, disk)
- Certificate expiration

### Alert Thresholds
- **Critical**: Service down, error rate >10%, certificate expiring <7 days
- **Warning**: Response time >2x normal, resource usage >85%
- **Info**: Certificate expiring <30 days, resource usage >70%

---

*This document supplements the main Operations Runbook with specific solutions derived from the Claude conversation history during development.*