# External Dependencies and Requirements

This document details all the external systems, services, and requirements needed to successfully deploy and operate the Sprocket infrastructure. **These are critical dependencies that must be in place before deployment.**

---

## Critical External Dependencies

### 1. Doppler (Secrets Management)
**Priority**: 🔴 **CRITICAL** - Cannot deploy without Doppler access

#### What It Is
Doppler is a secrets management platform that serves as the **source of truth for all application secrets** in the Sprocket infrastructure.

#### Why It's Required
- OAuth credentials (Google, Discord, Epic Games, Steam)
- API tokens (Ballchasing API, etc.)
- SMTP credentials for email
- Application-specific secrets
- Database passwords (non-infrastructure)
- Service integration keys

#### What's Stored in Doppler

**OAuth Providers**:
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
EPIC_GAMES_CLIENT_ID
EPIC_GAMES_CLIENT_SECRET
STEAM_API_KEY
```

**API Tokens**:
```
BALLCHASING_API_TOKEN
CHATWOOT_HMAC_KEY
```

**Email Configuration**:
```
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
```

**Application Secrets**:
```
SESSION_SECRET
JWT_SECRET
ENCRYPTION_KEY
```

#### How It's Used
1. **During Bootstrap**: `scripts/bootstrap-vault-secrets.sh` reads from Doppler
2. **Secret Provisioning**: Loads secrets into Vault at specific paths
3. **Runtime**: Services retrieve secrets from Vault (which came from Doppler)

#### Access Requirements
- Doppler project membership
- Read access to all required secrets
- Doppler CLI installed and authenticated

#### Setup Instructions
```bash
# Install Doppler CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Login to Doppler
doppler login

# Select project
doppler setup

# Verify access
doppler secrets
```

#### What Happens Without Doppler
❌ **Deployment will fail at secret provisioning step**
- OAuth authentication won't work
- API integrations will fail
- Services can't authenticate to external systems
- No email notifications

---

### 2. GitHub Organization
**Priority**: 🔴 **CRITICAL** - Required for Vault authentication and authorization

#### What It Is
The GitHub Organization (`SprocketBot`) manages team-based access control for Vault.

#### Why It's Required
- **Vault Authentication**: Uses GitHub OAuth for user authentication
- **Vault Authorization**: GitHub teams map to Vault policies
- **Access Control**: Team membership determines who can access which secrets

#### GitHub Teams → Vault Policies Mapping

| GitHub Team | Vault Policy | Access Level |
|-------------|--------------|--------------|
| `github-admin` | Admin access | Full access to all secrets, can manage policies |
| `github-readonly` | Read-only access | Can read but not modify secrets |
| `developers` | Developer access | Can read app secrets, not infrastructure secrets |
| `ops` | Operations access | Can manage infrastructure secrets |

#### Vault Policy Examples

**github-admin.hcl**:
```hcl
# Full access to all secret paths
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Can manage auth methods
path "auth/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
```

**github-readonly.hcl**:
```hcl
# Read-only access to secrets
path "secret/*" {
  capabilities = ["read", "list"]
}

# Cannot write or delete
```

#### GitHub OAuth Configuration
Vault is configured to use GitHub OAuth:
```hcl
auth "github" {
  organization = "SprocketBot"

  team_mappings = {
    "github-admin" = "admins"
    "github-readonly" = "readonly"
  }
}
```

#### Access Requirements
- Membership in SprocketBot GitHub organization
- Assignment to appropriate GitHub teams
- GitHub OAuth app configured for Vault

#### Setup Instructions
1. **Join GitHub Organization**: Must be invited by org admin
2. **Join Required Teams**: Request team membership
3. **GitHub OAuth**: Authenticate to Vault via GitHub
   ```bash
   vault login -method=github
   ```

#### What Happens Without GitHub Org Access
❌ **Cannot authenticate to Vault**
- No access to secrets
- Cannot provision new secrets
- Cannot manage infrastructure
- Team-based access control doesn't work

---

### 3. Digital Ocean Account
**Priority**: 🔴 **CRITICAL** - Required for managed services and infrastructure

#### What It Provides
1. **Managed PostgreSQL Database**
2. **Spaces (S3-compatible object storage)**
3. **Compute instances (Droplets)** (if used)

#### 3.1 Digital Ocean Managed PostgreSQL

**Why It's Used**:
- Production-grade database with automated backups
- Point-in-time recovery
- High availability option
- Automated maintenance and updates
- Better performance than self-hosted

**Connection Details**:
```
Host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
Port: 25060
Database: defaultdb
Connection Pool: Yes
SSL Mode: Required
```

**What's Stored**:
- All application data (users, games, teams, matches, etc.)
- Chatwoot data
- N8n workflows
- Grafana dashboards
- Application state

**Backup Strategy**:
- Daily automated backups (7-day retention)
- Point-in-time recovery (PITR) available
- Can restore to any point in last 7 days

**Access Requirements**:
- Database credentials (username/password)
- SSL certificate (automatic)
- Firewall rules allowing production node IP

#### 3.2 Digital Ocean Spaces (Object Storage)

**Primary Use**: Vault backend storage

**Bucket**: `vault-secrets`
**Endpoint**: `https://nyc3.digitaloceanspaces.com`
**Region**: NYC3

**Why It's Used**:
- Reliable S3-compatible storage
- Vault persistence across container restarts
- Automatic replication
- Cheaper than managing local storage

**Secondary Use**: Application file storage
- User uploads
- Generated images
- Replay files
- Backups

**Access Requirements**:
- Spaces access key
- Spaces secret key
- Bucket read/write permissions

**Configuration**:
```yaml
# In Pulumi config
vault-s3-bucket: vault-secrets
vault-s3-endpoint: https://nyc3.digitaloceanspaces.com
vault-s3-access-key: DO801Q8P44QRYP9HEQVL
vault-s3-secret-key: [secure]

s3-endpoint: nyc3.digitaloceanspaces.com
s3-access-key: DO004ZHPV38R8C9Q46XG
s3-secret-key: [secure]
```

#### What Happens Without Digital Ocean
❌ **Cannot deploy infrastructure**
- No database (all apps fail)
- Vault state not persistent
- File uploads don't work
- Backup/restore not possible

---

### 4. DNS Provider
**Priority**: 🟡 **HIGH** - Required for production, optional for local dev

#### What It Provides
DNS records for the Sprocket platform domains.

#### Required DNS Records

**For Production (sprocket.mlesports.gg)**:
```
A     sprocket.mlesports.gg           → <production-node-ip>
A     main.sprocket.mlesports.gg      → <production-node-ip>
A     api.sprocket.mlesports.gg       → <production-node-ip>
A     vault.sprocket.mlesports.gg     → <production-node-ip>
A     traefik.sprocket.mlesports.gg   → <production-node-ip>
```

**Or using wildcard**:
```
A     *.sprocket.mlesports.gg         → <production-node-ip>
A     sprocket.mlesports.gg           → <production-node-ip>
```

#### Why It's Required
- Let's Encrypt requires public DNS for certificate issuance
- HTTP-01 challenge verification
- Users access via domain names
- Service discovery and routing

#### Access Requirements
- DNS provider account (Cloudflare, Route53, etc.)
- Ability to create/modify A records
- DNS propagation time (~5-60 minutes)

#### Verification
```bash
# Check DNS resolution
nslookup sprocket.mlesports.gg
dig sprocket.mlesports.gg

# Should return production node IP
```

#### What Happens Without DNS
❌ **Production deployment not possible**
- Let's Encrypt certificates won't issue
- Users can't access services
- Traefik routing won't work (hostname-based)

**Workaround for Local Dev**:
- Use `/etc/hosts` file modifications
- Use `.localhost` domains
- Accept self-signed certificates

---

### 5. Pulumi Backend
**Priority**: 🔴 **CRITICAL** - Required for infrastructure state management

#### What It Provides
Stores Pulumi state for all infrastructure stacks.

#### Backend Options

**Option 1: Pulumi Cloud (Current)**:
```bash
pulumi login
```
- State stored in Pulumi's cloud
- Team collaboration
- State history
- Web UI for viewing resources

**Option 2: S3 Backend**:
```bash
pulumi login "s3://[bucket]/pulumi?endpoint=[endpoint]"
```
- Self-hosted state
- S3-compatible storage
- More control
- Requires S3 credentials

#### Required Configuration
```bash
# AWS credentials for S3 backend
~/.aws/credentials:
[default]
aws_access_key_id = [your key]
aws_secret_access_key = [your secret]
region = us-east-1
```

#### What's Stored
- Infrastructure state for all three layers
- Resource dependencies
- Configuration values (encrypted)
- Output values
- Deployment history

#### Access Requirements
- Pulumi account (for Pulumi Cloud)
- OR S3 credentials (for S3 backend)
- Organization/project membership
- Write access to state storage

#### Stack Names
- `layer_1`
- `layer_2`
- `prod` (platform stack)

#### What Happens Without Pulumi Backend
❌ **Cannot manage infrastructure**
- No deployment possible
- Can't track resource state
- Risk of resource conflicts
- No rollback capability

---

### 6. Docker Hub Account
**Priority**: 🟡 **HIGH** - Required for private images

#### What It Provides
Access to private Docker images for Sprocket services.

#### Private Images
- `asaxplayinghorse/sprocket-web`
- `asaxplayinghorse/sprocket-api`
- `asaxplayinghorse/sprocket-image-generation`
- `asaxplayinghorse/sprocket-discord-bot`
- Other microservices

#### Why It's Required
- Services are not public
- Pull from private repositories
- Specific image tags (e.g., `main`, `staging`)

#### Configuration
```yaml
# In Pulumi config
docker-username: asaxplayinghorse
docker-access-token: [secure]
```

#### Used In
- Docker service configurations
- Image pull secrets
- Registry authentication

#### What Happens Without Docker Hub Access
❌ **Cannot pull application images**
- Services won't start
- Image pull failures
- Deployment blocked

**Workaround**:
- Use public images (if available)
- Build images locally
- Use different registry

---

## Development Tools and CLI Requirements

### Required on Deployment Machine

#### 1. Node.js
**Version**: 16.x (required for some Pulumi operations)
```bash
# Check version
node --version

# Install with nvm
nvm install 16
nvm use 16
```

#### 2. Pulumi CLI
```bash
# Install
curl -fsSL https://get.pulumi.com | sh

# Verify
pulumi version
```

#### 3. Docker
```bash
# Verify
docker --version
docker info | grep Swarm
# Should show: Swarm: active
```

#### 4. Vault CLI (for secret management)
```bash
# Install
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# Verify
vault version
```

#### 5. Git
```bash
# Verify
git --version
```

---

## Network Requirements

### Firewall Rules

**Inbound** (Production node):
```
Port 80   (HTTP)  - Let's Encrypt challenges
Port 443  (HTTPS) - Application traffic
Port 22   (SSH)   - Management access
```

**Outbound**:
```
Port 443  (HTTPS) - GitHub, Doppler, Docker Hub, Digital Ocean
Port 80   (HTTP)  - Package managers, Let's Encrypt
Port 25060 (PostgreSQL) - Managed database connection
Port 5432 (PostgreSQL) - Managed database connection (alt)
```

### DNS Resolution
```
Access to public DNS servers
Ability to resolve:
  - github.com
  - doppler.com
  - hub.docker.com
  - digitalocean.com
  - nyc3.digitaloceanspaces.com
  - sprocketbot-postgres-*.db.ondigitalocean.com
```

---

## Access Checklist

Before attempting deployment, verify you have:

**Secrets and Configuration**:
- [ ] Doppler account and project access
- [ ] GitHub organization membership
- [ ] GitHub team assignments (admin or appropriate level)
- [ ] Digital Ocean account access
- [ ] Digital Ocean managed PostgreSQL credentials
- [ ] Digital Ocean Spaces credentials
- [ ] Docker Hub credentials (username + access token)
- [ ] Pulumi backend access (Pulumi Cloud or S3)

**DNS and Network**:
- [ ] DNS provider access
- [ ] A records configured (for production)
- [ ] Firewall rules configured
- [ ] Production node accessible via SSH

**Local Tools**:
- [ ] Node.js 16.x installed
- [ ] Pulumi CLI installed and authenticated
- [ ] Docker installed (with Swarm initialized)
- [ ] Vault CLI installed
- [ ] Git configured

**Documentation Access**:
- [ ] This repository cloned
- [ ] Vault unseal keys location known
- [ ] Root token location known (if needed)

---

## Dependency Graph

```
                    Doppler
                      │
                      ├──────┐
                      ▼      ▼
                   Vault  Services
                      │      │
    ┌─────────────────┼──────┼────────────┐
    │                 │      │            │
    ▼                 ▼      ▼            ▼
GitHub Org    Digital Ocean    Docker Hub    DNS Provider
    │               │                            │
    ├─── Auth ──────┤                            │
    │               ├─── Database                │
    │               ├─── Spaces (S3)             │
    │               └─── Droplets                │
    │                                            │
    └──────────────── Pulumi Backend ───────────┘
                           │
                           ▼
                    Infrastructure
                      Deployment
```

---

## Cost Considerations

### Monthly Costs (Approximate)

**Digital Ocean**:
- Managed PostgreSQL (Basic): $15-60/month (depending on size)
- Spaces: $5/month + $0.02/GB transfer
- Droplet (if used): $6-40/month

**Pulumi Cloud**:
- Free tier: Up to 500 resources
- Team: $75/month (if needed)

**Doppler**:
- Free tier: Up to 5 users
- Team: $8/user/month (if needed)

**Domain Registration**:
- ~$10-15/year

**Docker Hub**:
- Free tier: 1 user, unlimited public repos
- Pro: $5/month for private repos

**Total Estimated**: $30-150/month depending on scale

---

## Security Considerations

### Secret Storage
- ✅ Doppler: Encrypted at rest and in transit
- ✅ Vault: Encrypted storage on S3
- ✅ Pulumi: Secrets encrypted in state files
- ⚠️ Never commit secrets to git
- ⚠️ Rotate credentials regularly

### Access Control
- Use least-privilege principle
- GitHub team-based access
- Vault policies per team
- Regular access reviews

### Backup Strategy
- Database: Daily automated backups
- Vault state: S3 replication
- Pulumi state: Version history
- Git: Repository backups

---

## Disaster Recovery

### If Doppler Is Unavailable
1. Have backup export of secrets in secure location
2. Can manually provision to Vault
3. Deploy with partial functionality
4. Restore from Doppler when available

### If GitHub Org Is Unavailable
1. Use Vault root token for emergency access
2. Temporarily disable GitHub auth
3. Use alternative auth method (userpass)
4. Restore GitHub auth when available

### If Digital Ocean Database Is Down
1. Contact Digital Ocean support
2. Restore from point-in-time backup
3. Consider failover to replica (if configured)
4. Application is fully down until DB restored

### If Pulumi State Is Lost
⚠️ **CRITICAL SITUATION**
1. Check Pulumi Cloud history
2. Restore from S3 backup (if S3 backend)
3. May need to import existing resources
4. Potentially recreate infrastructure from scratch

**Prevention**:
- Regular state exports: `pulumi stack export > backup.json`
- Store backups in multiple locations

---

This document represents the full dependency tree for the Sprocket infrastructure. **All of these externalities must be in place and accessible for successful deployment.**
