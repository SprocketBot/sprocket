# Technical Challenges and Solutions

A detailed account of the major technical challenges encountered during the Sprocket infrastructure deployment and how they were resolved.

**Note**: For operational troubleshooting procedures derived from Claude conversation history, see [`TECHNICAL_CHALLENGES_FROM_CLAUDE_CONVERSATIONS.md`](TECHNICAL_CHALLENGES_FROM_CLAUDE_CONVERSATIONS.md) and the troubleshooting section in [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md#troubleshooting-guide-from-development-experience).

## Challenge 1: Vault Bootstrapping and Unsealing

### The Problem
Vault requires initialization and unsealing on first start, but the unseal keys need to be stored securely and used automatically on subsequent deployments. This created a chicken-and-egg problem:
- Can't provision secrets without Vault being unsealed
- Can't unseal Vault without having the unseal keys
- Can't make deployment repeatable without automating unseal process

### Symptoms
- Vault container would start but be sealed
- Services couldn't retrieve secrets from Vault
- Manual unsealing required after every deployment
- Unseal tokens stored inconsistently

### Evolution Through Commits
1. **Sept 17-18**: Initial Vault deployment issues
   - Commit `5de5d04`: "bootstrapping problems with minio and other vault secrets"
   - Vault wouldn't stay accessible

2. **Sept 18**: Localhost access achieved
   - Commit `cde2961`: "Accessing vault now works on localhost"
   - But still manual process

3. **Sept 19**: Breakthrough on automation
   - Commit `5057afc`: "vault actually unseals!"
   - Auto-unseal script working
   - Commit `346c2a9`: Documentation of learnings

4. **Sept 19**: Still polishing
   - Commit `fff0c3c`: "still polishing layer_1 to be repeatable"
   - Making the process truly repeatable

5. **Sept 21**: Final solution
   - Commit `2103358`: "all tokens working now. Vault should be good!"
   - Automated unseal process complete

### Solution
1. **Initialization Script**: Created script to detect if Vault is initialized
   ```bash
   # Check if unseal_tokens.txt exists
   if [ ! -f "unseal_tokens.txt" ]; then
     vault operator init > unseal_tokens.txt
   fi
   ```

2. **Auto-unseal Process**: Script reads unseal keys and unseals Vault
   ```bash
   # Extract unseal keys and unseal
   grep 'Unseal Key' unseal_tokens.txt | awk '{print $4}' | head -3 | while read key; do
     vault operator unseal $key
   done
   ```

3. **Persistence**: Store unseal tokens securely (not in git)
   - Added to `.gitignore`
   - Documented where to find them

4. **S3 Backend**: Vault state persists to Digital Ocean Spaces
   - Survives container restarts
   - Shared across deployments

### Lessons Learned
- Vault unsealing cannot be fully automated without cloud auto-unseal (which requires cloud KMS)
- Store unseal keys securely but accessibly for automation
- Test initialization process from scratch multiple times
- Document the manual recovery process for when automation fails

---

## Challenge 2: Database Management vs. Managed Services

### The Problem
Initially PostgreSQL was deployed as a Docker service managed by Pulumi. This created several issues:
- Data persistence concerns with Docker volumes
- Backup/restore complexity
- Resource management on single node
- No built-in high availability
- Manual maintenance required

### The Decision Point
**Key Question**: Should we manage PostgreSQL ourselves or use a managed service?

**Trade-offs**:
| Self-Managed | Managed Service (Digital Ocean) |
|--------------|--------------------------------|
| Full control | Less control |
| No extra cost | Monthly cost |
| Complex backups | Automated backups |
| Manual scaling | Easy scaling |
| Single point of failure | High availability |
| DIY maintenance | Managed updates |

### The Solution
**November 1-3, 2025**: Migrated to Digital Ocean Managed PostgreSQL

**Implementation Steps**:
1. Created managed PostgreSQL cluster on Digital Ocean
2. Updated all Pulumi configs with new connection details:
   - `postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com`
   - `postgres-port: 25060`
3. Removed PostgreSQL service from `layer_2`
4. Updated all service providers to connect to external database
5. Migrated data from old PostgreSQL to managed instance
6. Updated `SprocketPostgresProvider` to support external connections

**Code Changes**:
- Removed local PostgreSQL service definition
- Updated connection strings across all services
- Modified provider to set `superuser=false` for managed DB
- Removed PostgreSQL-specific Docker networks

### Impact
✅ **Positive**:
- Automated daily backups with 7-day retention
- Point-in-time recovery capability
- Better performance (dedicated resources)
- Reduced maintenance burden
- Professional-grade reliability

⚠️ **Considerations**:
- Monthly cost added to infrastructure
- External dependency (requires internet connectivity)
- Less flexibility for database-specific tuning
- Vendor lock-in to Digital Ocean

### Lessons Learned
- **Don't manage databases in production unless you have to**
- Managed services are worth the cost for critical data stores
- Plan data migration carefully (backup before, verify after)
- Update all connection configs in one atomic change
- Document external dependencies clearly

---

## Challenge 3: Storage Backend Evolution (MinIO → S3)

### The Problem
Initially used MinIO for S3-compatible object storage, deployed as a Docker service. Issues encountered:
- MinIO required significant resources
- Vault S3 backend had stability issues with self-hosted MinIO
- Additional service to maintain
- Backup complexity for MinIO data itself

### Timeline
1. **Early deployment**: MinIO for all S3 needs
2. **Sept 30** (commit `3f32a74`): Began migration to cloud S3
   - "migrate to cloud S3 and fix service configurations"
   - Updated `SprocketMinioProvider` to support direct credentials
3. **Oct 8** (commit `3b45f27`): Completed migration
   - "Move from MinIO to AWS. Remove postgres network."
   - Removed MinIO service entirely

### Solution
1. **Phase 1**: Dual operation
   - Kept MinIO running
   - Migrated Vault to Digital Ocean Spaces
   - Tested stability

2. **Phase 2**: Service migration
   - Updated application services to use cloud S3
   - Migrated existing data
   - Verified all services working

3. **Phase 3**: Cleanup
   - Removed MinIO service definition
   - Removed MinIO-related configuration
   - Updated documentation

**Configuration Changes**:
```yaml
# Old (MinIO)
s3-endpoint: minio.localhost
s3-access-key: local-minio-key
s3-secret-key: local-minio-secret

# New (Digital Ocean Spaces)
s3-endpoint: nyc3.digitaloceanspaces.com
s3-access-key: DO004ZHPV38R8C9Q46XG
s3-secret-key: [secure]
```

### Lessons Learned
- Cloud storage is more reliable than self-hosted for critical data
- S3-compatible APIs make migration easier
- Test storage backend changes thoroughly (Vault especially sensitive)
- Migrate in phases to reduce risk

---

## Challenge 4: Routing Complexity (Localhost, LAN, Cloud)

### The Problem
Need to support three different access patterns:
1. **Local development**: `.localhost` domains
2. **LAN access**: Direct IP (192.168.4.39)
3. **Tailscale access**: Tailscale IP (100.110.185.84)
4. **Production cloud**: Real domain (sprocket.mlesports.gg)

Each pattern requires different Traefik routing rules and certificate handling.

### Symptoms
- 404 errors when accessing via different methods
- Certificate warnings for localhost
- Can't access from LAN using domain names
- Duplicate router errors in Traefik

### Evolution
**Oct 27** (commit `7486e02`): Major routing overhaul
- Added IP-based routing alongside hostname routing
- Created routing rules: `Host(\`sprocket.localhost\`) || Host(\`192.168.4.39\`) || Host(\`100.110.185.84\`)`
- Documented differences between local and cloud deployments
- Created CLOUD_DEPLOYMENT.md and LOCAL_ACCESS.md

### Solution

**For Local Development**:
```typescript
// Platform.ts - Multi-mode routing
const hostRules = [];

// Hostname-based routing
if (hostname) {
  hostRules.push(`Host(\`${subdomain}.${hostname}\`)`);
}

// IP-based routing for LAN access
if (serverIp) {
  hostRules.push(`Host(\`${serverIp}\`)`);
}

// Tailscale routing
if (tailscaleIp) {
  hostRules.push(`Host(\`${tailscaleIp}\`)`);
}

const routingRule = hostRules.join(' || ');
```

**For Production**:
```yaml
# Pulumi config
hostname: sprocket.mlesports.gg
# Remove server-ip and tailscale-ip configs
```

**Traefik Configuration**:
- Let's Encrypt for production domains
- Self-signed certs for localhost
- No cert verification for IP-based access

### Lessons Learned
- **Design for multiple access patterns from the start**
- Document which config to use for which scenario
- Test each access method independently
- IP-based routing is a hack, use proper DNS when possible
- `/etc/hosts` modifications work for local testing

---

## Challenge 5: Secret Management Across Vault and Doppler

### The Problem
Secrets scattered across multiple sources:
- Some in Pulumi config (encrypted)
- Some in Vault (retrieved by services)
- Some in Doppler (primary source of truth)
- Manual secret provisioning steps

### Challenges
1. **Bootstrapping**: Need secrets to initialize Vault, but Vault stores secrets
2. **Service Configuration**: Services need Vault address before Vault exists
3. **OAuth Credentials**: Multiple providers with different secret formats
4. **Rotation**: How to update secrets across all systems

### Solution Architecture

**1. Doppler as Source of Truth**:
- All secrets stored in Doppler project
- Categories:
  - OAuth (Google, Discord, Epic, Steam)
  - API tokens (Ballchasing)
  - Database credentials
  - SMTP settings
  - Application secrets

**2. Pulumi for Infrastructure Secrets**:
```yaml
# Only infrastructure-level secrets in Pulumi
docker-access-token: [secure]
vault-s3-secret-key: [secure]
postgres-password: [secure]
```

**3. Vault for Application Secrets**:
- Services retrieve secrets at runtime
- Vault policies control access
- GitHub teams map to Vault policies

**4. Bootstrap Process**:
```bash
# scripts/bootstrap-vault-secrets.sh
1. Load secrets from Doppler
2. Wait for Vault to be unsealed
3. Provision secrets to Vault paths:
   - platform/{env}/manual/oauth/*
   - platform/ballchasing
   - platform/{env}/chatwoot
```

### Secret Flow
```
Doppler (Source of Truth)
    ↓
Bootstrap Script
    ↓
Vault (Runtime Storage)
    ↓
Application Services
```

### Lessons Learned
- **Centralize secret source of truth** (Doppler)
- Use Vault for runtime secret distribution
- Keep infrastructure secrets in Pulumi config
- Document secret bootstrap process clearly
- **Never commit secrets to git** (even encrypted ones are risky)
- Automate secret provisioning to reduce human error

---

## Challenge 6: Service Discovery and Traefik Integration

### The Problem
Docker Swarm services need to be automatically discovered by Traefik and routed correctly, but:
- Services may not be ready when Traefik starts
- Labels need to be precisely configured
- Multiple services on same port need different routing
- TLS termination complexity

### Symptoms
- 404 errors even though services are running
- Traefik dashboard shows no routers
- Services visible in `docker service ls` but not accessible
- Duplicate router errors

### Root Causes
1. **Orphaned Service Tasks**: Old service versions not cleaned up
2. **Label Syntax Errors**: Traefik label typos or incorrect values
3. **Network Misconfiguration**: Services not on ingress network
4. **Timing Issues**: Traefik caches configuration

### Solution

**1. Proper Service Labels**:
```typescript
// In service definition
labels: {
  'traefik.enable': 'true',
  'traefik.http.routers.sprocket-web.rule': `Host(\`sprocket.${hostname}\`)`,
  'traefik.http.routers.sprocket-web.entrypoints': 'websecure',
  'traefik.http.routers.sprocket-web.tls': 'true',
  'traefik.http.routers.sprocket-web.tls.certresolver': 'letsencrypt',
  'traefik.http.services.sprocket-web.loadbalancer.server.port': '3000',
}
```

**2. Network Configuration**:
```typescript
// Ensure service is on ingress network
networks: ['ingress']
```

**3. Cleanup Procedure**:
```bash
# Remove orphaned tasks
docker service update --force <service-name>

# Or full cleanup
docker service rm <service-name>
pulumi up  # Recreate
```

**4. Verification**:
```bash
# Check Traefik sees the service
docker exec $(docker ps -q -f name=traefik) \
  wget -qO- http://localhost:8080/api/http/routers | jq
```

### Lessons Learned
- **Always verify network membership**
- Use consistent label naming scheme
- Test with Traefik dashboard/API
- Force update services when routing changes
- Give Traefik 30-60 seconds for discovery

---

## Challenge 7: Certificate Management (Let's Encrypt)

### The Problem
Need automatic TLS certificates for production, but:
- Let's Encrypt requires public DNS
- Rate limits prevent excessive testing
- Localhost can't get real certificates
- Certificate renewal must be automatic

### Failure Modes Encountered
1. **Rate Limiting**: Too many cert requests during testing
2. **DNS Not Ready**: Requesting certs before DNS propagates
3. **Challenge Failures**: HTTP-01 challenge can't reach server
4. **Mixed Local/Prod**: Using production config locally

### Solution

**For Production**:
```yaml
# Traefik configuration
--certificatesresolvers.letsencrypt.acme.email=admin@example.com
--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
```

**For Local Development**:
- Use Traefik's default self-signed certificates
- Accept certificate warnings in browser
- Don't configure Let's Encrypt resolver

**For Testing**:
```yaml
# Use Let's Encrypt staging
--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
```

### Rate Limit Recovery
When hit with rate limits:
1. Wait 1 hour (soft limit resets)
2. Use staging environment for testing
3. Verify DNS before requesting prod certs
4. Consolidate to wildcard cert if possible

### Lessons Learned
- **Test with Let's Encrypt staging first**
- Verify DNS propagation before cert requests
- One cert provisioning attempt can take 60+ seconds
- Persistent storage crucial (don't lose acme.json)
- Rate limits are per domain, plan accordingly

---

## Patterns and Best Practices Discovered

### 1. Layered Deployment
**Pattern**: Deploy infrastructure in dependency order
```
Layer 1 (Foundation) → Layer 2 (Data) → Platform (Apps)
```
**Why**: Each layer depends on previous layers being healthy

### 2. Configuration Hierarchy
**Pattern**: Environment-specific config overrides
```
Global defaults → Stack config → Environment variables → Doppler
```

### 3. Health Checks
**Pattern**: Verify each layer before proceeding
```bash
# After each layer
1. Check service status: docker service ls
2. Check service logs: docker service logs <name>
3. Verify connectivity: curl https://endpoint
4. Check Traefik routes: query Traefik API
```

### 4. Rollback Strategy
**Pattern**: Keep previous working state
```bash
# Before major changes
1. Document current state
2. Export Pulumi stack: pulumi stack export > backup.json
3. Tag git commit
4. Test rollback procedure
```

### 5. Secret Provisioning
**Pattern**: Separate secret sources by use case
```
Infrastructure secrets → Pulumi config
Application secrets → Vault (from Doppler)
Temporary tokens → Vault (generated)
```

---

## What Would We Do Differently?

### 1. Database from Day One
- Start with managed PostgreSQL instead of self-hosted
- Saves time and complexity
- Worth the cost

### 2. Simpler Storage
- Use cloud S3 from the beginning
- Skip MinIO entirely
- One less service to manage

### 3. Better Secret Strategy
- Establish Doppler → Vault flow earlier
- Document secret paths from start
- Create secret migration scripts

### 4. Routing Design
- Design for production first
- Add development overrides later
- Avoid IP-based routing hacks

### 5. Documentation as We Go
- Document decisions when making them
- Keep architectural decision records (ADRs)
- Don't rely on commit messages alone

### 6. Testing Environments
- Separate dev/staging/prod stacks earlier
- Use Let's Encrypt staging for testing
- Create reproducible test environments

---

## Critical Success Factors

What made this deployment eventually successful:

1. **Persistence**: Many iterations to get it right
2. **Git History**: Detailed commit messages helped track changes
3. **Incremental Changes**: Small commits, test often
4. **External Services**: Managed DB and storage reduced complexity
5. **Community Tools**: Pulumi, Traefik, Vault well-documented
6. **Automation**: Scripts for repeatable processes
7. **Documentation**: Writing things down as we learned

The journey from first commit to production took months, but the result is a robust, maintainable infrastructure.
