# Sprocket Infrastructure Deployment Guide

**Version**: 1.1
**Last Updated**: December 4, 2025
**Difficulty**: Advanced
**Estimated Time**: 4-6 hours (first-time deployment)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Layer 1 Deployment](#layer-1-deployment)
5. [Secret Provisioning](#secret-provisioning)
6. [Layer 2 Deployment](#layer-2-deployment)
7. [Platform Deployment](#platform-deployment)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Deployment Architecture Overview

**⚠️ Important Context**: The deployment diagram below shows a **generic cloud architecture pattern**. Our actual deployment uses **Docker Swarm on Digital Ocean**, not GCP Cloud Run. The diagram illustrates the conceptual architecture that could apply to cloud deployments, but the specific technologies differ from our current stack.

![Deployment Architecture](./deployment-architecture.png)

**Our Actual Deployment**:
- **Platform**: Docker Swarm on a Digital Ocean Droplet (single-node, can scale to multi-node)
- **Services**: Containerized microservices (Sprocket Web, API, Discord Bot, background workers)
- **Data**: Managed PostgreSQL (Digital Ocean), self-hosted Redis, S3-compatible storage (Digital Ocean Spaces)
- **Infrastructure**: Traefik (reverse proxy), Vault (secrets), monitoring stack (Grafana, InfluxDB)
- **CI/CD**: Pulumi (Infrastructure as Code), manual deployments via CLI

The diagram represents a **future cloud-native deployment option** or a conceptual reference architecture.

---

## Business Context & Planning

**For Decision Makers & Project Managers**

Before beginning a deployment, understand the resource investment required. This section provides non-technical context about what a deployment entails.

### Time Investment

| Deployment Stage | First-Time | Experienced Engineer | Notes |
|------------------|------------|---------------------|-------|
| **Prerequisites Setup** | 2-3 hours | 30-60 minutes | One-time setup per engineer |
| **External Services** | 1-2 hours | 15-30 minutes | Creating managed database, S3 buckets |
| **Layer 1 Deployment** | 1-2 hours | 15-30 minutes | Core infrastructure (Vault, Traefik) |
| **Secret Provisioning** | 30-60 minutes | 10-15 minutes | Copying secrets from Doppler to Vault |
| **Layer 2 Deployment** | 1-2 hours | 20-40 minutes | Data services (Redis, databases, monitoring) |
| **Platform Deployment** | 1-2 hours | 20-40 minutes | Application services |
| **Verification & Testing** | 1-2 hours | 30-60 minutes | Confirming everything works |
| **Total Estimated Time** | **6-12 hours** | **2-4 hours** | Spread across 1-2 days typically |

**Why the Time Range?**
- **First deployment**: Includes learning curve, troubleshooting, understanding architecture
- **Subsequent deployments**: Familiarity with process significantly reduces time
- **Team deployment**: With 2 engineers working together, can complete in 4-6 hours

### Required Skills

You'll need engineers with experience in:

| Skill Area | Importance | Why It's Needed |
|------------|------------|-----------------|
| **Docker & Docker Swarm** | Critical | All services run in Docker containers orchestrated by Swarm |
| **Command Line / Bash** | Critical | Most operations happen via terminal commands |
| **Infrastructure as Code (Pulumi/Terraform)** | High | All infrastructure defined in Pulumi TypeScript code |
| **Networking Basics** | Medium | Understanding DNS, ports, proxies helpful for troubleshooting |
| **Linux System Administration** | Medium | SSH access, file permissions, system troubleshooting |
| **Cloud Services (Digital Ocean/AWS)** | Medium | Setting up managed database, S3 storage |

**Minimum Team Size**: 1 experienced engineer can do the deployment, but 2 is recommended for first deployment.

**Skill Level**: This is not a beginner-friendly deployment. Engineer(s) should have:
- 2+ years of DevOps/infrastructure experience
- Previous experience with Docker
- Comfort with command-line operations
- Ability to debug when things don't work as expected

### Cost Breakdown

#### One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| **Domain Name** | $10-15/year | If not already owned (e.g., `sprocket.mlesports.gg`) |
| **SSL Certificate** | $0 | Let's Encrypt provides free certificates |
| **Initial Engineering Time** | $800-2,400 | 8-12 hours @ $100-200/hour (varies by location/seniority) |
| **Total One-Time** | **$810-2,415** | Mostly engineering time |

#### Monthly Recurring Costs

| Component | Monthly Cost | Annual Cost | Can Optimize? |
|-----------|-------------|-------------|---------------|
| **Digital Ocean Droplet** (4 vCPUs, 8GB RAM) | $96 | $1,152 | ✓ Yes - can downsize to $72/mo if usage is low |
| **Managed PostgreSQL** (Basic tier) | $15 | $180 | ✗ No - critical service |
| **Block Storage Volumes** (100GB total) | $15 | $180 | ~ Maybe - review usage after 1 month |
| **Spaces Storage (S3)** | $5 | $60 | ~ Maybe - implement cleanup policy |
| **Domain Name** | ~$1 | $12 | ✗ No |
| **Total Monthly** | **$132** | **$1,584/year** | |

**Potential Savings**:
- If actual usage is consistently <50% CPU/memory, could downsize Droplet to $72/month
- Estimated potential savings: $15-30/month ($180-360/year)

**Cost Comparison to Alternatives**:

| Alternative Approach | Est. Monthly Cost | Trade-offs |
|---------------------|-------------------|------------|
| **Current Setup** (managed services) | $132/month | Low maintenance, reliable, documented |
| **All Self-Hosted** (no managed DB) | $100/month | Saves $30/mo but adds 10-15 hours/month maintenance |
| **Full AWS/GCP** (managed everything) | $300-500/month | More features, auto-scaling, but 3-4x cost |
| **Serverless** (Vercel/Netlify/Lambda) | $150-300/month | Different architecture, would require code rewrite |

**ROI Analysis**: Even at $100/hour, 10 hours of maintenance costs more than the $30/month saved by self-hosting the database. Managed services are cost-effective for teams with limited DevOps bandwidth.

### Risk Factors

**What Could Extend Timeline?**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **DNS propagation delays** | Medium | +1-4 hours | Set up DNS 24 hours before deployment |
| **Let's Encrypt rate limits** | Low | +1-24 hours | Use staging certs for testing, production once |
| **Missing credentials/access** | Medium | +1-2 hours | Complete access checklist before starting |
| **Docker Hub image pull failures** | Low | +30-60 min | Verify image access beforehand |
| **First-time Pulumi issues** | Medium (first-timers) | +1-3 hours | Review Pulumi docs, have backup support |
| **Network/firewall issues** | Low | +1-2 hours | Test connectivity, document firewall rules |
| **Vault unsealing problems** | Low | +30-60 min | Follow Vault initialization carefully |

**Highest Impact Risks**:
1. **Not having required access credentials** - Have all API keys, passwords, tokens ready before starting
2. **Unfamiliarity with tools** - First deployment should be paired with someone experienced
3. **Production vs. test environment confusion** - Use local/staging for first attempt

### Prerequisites Checklist (for Project Managers)

Before scheduling a deployment, ensure:

- [ ] **Budget Approved**: $132/month recurring + ~$1,000 one-time engineering
- [ ] **Engineering Time Allocated**: Block 8-12 hours for first deployment (can span 1-2 days)
- [ ] **Access Granted**:
  - [ ] Digital Ocean account with billing configured
  - [ ] Doppler account with secrets populated
  - [ ] GitHub organization membership
  - [ ] Docker Hub access to private repositories
  - [ ] DNS provider access (to create A records)
- [ ] **Server Ready**: Production server provisioned (or local dev environment ready)
- [ ] **Backup Engineer Available**: In case primary engineer gets blocked

### What Happens After Deployment?

**Immediate (First 24 hours)**:
- Monitor service health
- Watch for errors in logs
- Verify all features work (login, match creation, Discord bot)
- Test external integrations (OAuth, Ballchasing API)

**First Week**:
- Monitor resource usage (CPU, memory, disk)
- Identify any services using excessive resources
- Fine-tune service replica counts if needed
- Set up monitoring alerts

**First Month**:
- Review costs vs. budget
- Analyze usage patterns
- Right-size infrastructure if possible (downsize droplet if underutilized)
- Implement any missing monitoring/alerting

**Ongoing**:
- **Monthly**: Review costs, check for security updates
- **Quarterly**: Test disaster recovery procedure
- **As Needed**: Deploy application updates (typically 15-30 minutes per deploy)

### When NOT to Deploy

**Delay deployment if**:
- Required credentials/access not available (will cause delays mid-deployment)
- Engineer unfamiliar with Docker and no backup support available
- Production server doesn't meet minimum specs (4 CPU, 8GB RAM)
- Budget not yet approved for monthly recurring costs
- During critical business periods (deploy during low-usage windows)
- Friday afternoon or before long weekend (no time to address issues)

**Best Time to Deploy**:
- Monday-Wednesday (full week to address issues)
- Morning/early afternoon (full day available if problems arise)
- Low-usage period for your application
- When 2 engineers available (one primary, one backup)

---

## Prerequisites

### Required Access

Before starting, ensure you have access to:

- [ ] **Doppler** project with all required secrets
- [ ] **GitHub Organization** (`SprocketBot`) membership
- [ ] **Digital Ocean** account with:
  - [ ] Managed PostgreSQL database provisioned
  - [ ] Spaces (S3) access configured
  - [ ] Droplet or production node access
- [ ] **Pulumi Backend** access (Pulumi Cloud or S3 backend)
- [ ] **Docker Hub** credentials for private images
- [ ] **DNS Provider** access (for production deployment)

### Required Software

Install the following on your deployment machine:

```bash
# Node.js 16.x (required for Pulumi operations)
nvm install 16
nvm use 16

# Pulumi CLI
curl -fsSL https://get.pulumi.com | sh

# Vault CLI
wget https://releases.hashicorp.com/vault/1.10.0/vault_1.10.0_linux_amd64.zip
unzip vault_1.10.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# jq (for JSON processing)
sudo apt-get install jq  # Debian/Ubuntu
# or
brew install jq  # macOS

# Doppler CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Verify installations
node --version   # Should be v16.x.x
pulumi version
vault version
jq --version
doppler --version
```

### Production Node Requirements

**Minimum Specifications**:
- **CPU**: 4 cores
- **RAM**: 8GB (16GB recommended)
- **Disk**: 100GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04+ or similar

**Software Requirements**:
```bash
# Docker (with Swarm mode)
curl -fsSL https://get.docker.com | sh
docker swarm init

# Verify Docker Swarm is active
docker info | grep Swarm
# Should show: Swarm: active
```

---

## Pre-Deployment Checklist

### 1. External Services Configuration

#### A. Digital Ocean Managed PostgreSQL

**Create Database**:
1. Log into Digital Ocean console
2. Navigate to Databases → Create Database
3. Choose PostgreSQL, select version 13+
4. Choose plan (Basic $15/month minimum)
5. Choose datacenter region (NYC3 recommended)
6. Name: `sprocketbot-postgres`
7. Wait for provisioning (~5 minutes)

**Get Connection Details**:
```
Host: sprocketbot-postgres-XXXXX-do-user-XXXXX-0.j.db.ondigitalocean.com
Port: 25060
Database: defaultdb
User: doadmin
Password: [from console]
SSL Mode: require
```

**Save these details** - you'll need them for Pulumi configuration.

#### B. Digital Ocean Spaces (S3)

**Create Spaces**:
1. Navigate to Spaces → Create Space
2. Choose datacenter (NYC3 recommended)
3. Create two spaces:
   - `vault-secrets` (for Vault backend)
   - `sprocket-storage` (for application files)
4. Generate Spaces access key:
   - API → Spaces Access Keys → Generate New Key
   - Save **Access Key** and **Secret Key**

**Configuration**:
```
Endpoint: nyc3.digitaloceanspaces.com
Access Key: DO004ZHPV38R8C9Q46XG
Secret Key: [from console]
Bucket (Vault): vault-secrets
Bucket (App): sprocket-storage
```

#### C. Doppler Setup

**Login and Configure**:
```bash
# Login to Doppler
doppler login

# Set up project
doppler setup

# Verify secrets
doppler secrets
```

**Required Secrets in Doppler**:
```
# OAuth Credentials
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
EPIC_CLIENT_ID
EPIC_CLIENT_SECRET
STEAM_API_KEY

# API Tokens
BALLCHASING_API_TOKEN

# Application Secrets
CHATWOOT_HMAC_KEY

# Storage Credentials
MINIO_ACCESS_KEY  # For S3 access
MINIO_SECRET_KEY  # For S3 secret
```

**Export for Bootstrap Script**:
```bash
# Export all secrets to environment
eval $(doppler secrets download --no-file --format env-no-quotes)

# Verify exports
echo $GOOGLE_CLIENT_ID  # Should show value
```

#### D. DNS Configuration (Production Only)

**For Production Deployment**:

Required DNS records pointing to your production node IP:

```
A     sprocket.mlesports.gg            → <production-ip>
A     api.sprocket.mlesports.gg        → <production-ip>
A     vault.sprocket.mlesports.gg      → <production-ip>
A     traefik.sprocket.mlesports.gg    → <production-ip>

# Or use wildcard
A     *.sprocket.mlesports.gg          → <production-ip>
```

**Verify DNS Propagation**:
```bash
# Wait 5-10 minutes after creating records
nslookup sprocket.mlesports.gg
# Should return your production IP

dig sprocket.mlesports.gg
# Should show A record pointing to your IP
```

**For Local Development**:
```bash
# Add to /etc/hosts instead
echo '127.0.0.1 sprocket.localhost api.sprocket.localhost vault.localhost' | sudo tee -a /etc/hosts
```

### 2. Firewall Configuration

**Production Node Firewall Rules**:

```bash
# Allow HTTP (for Let's Encrypt)
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow SSH (restrict to your IP)
sudo ufw allow from YOUR_IP to any port 22

# Enable firewall
sudo ufw enable
```

**Cloud Provider Firewall** (if using Digital Ocean, AWS, etc.):
- Allow inbound: 80/tcp, 443/tcp
- Allow outbound: all (or specific ports)

### 3. Repository Setup

```bash
# Clone repository
git clone git@github.com:SprocketBot/sprocket-infra.git
cd sprocket-infra

# Verify structure
ls -la
# Should see: layer_1/, layer_2/, platform/, global/, scripts/
```

### 4. Pulumi Backend Configuration

**Option A: Pulumi Cloud** (Recommended for teams)
```bash
# Login to Pulumi Cloud
pulumi login

# Verify
pulumi whoami
```

**Option B: S3 Backend** (Self-hosted)
```bash
# Create ~/.aws/credentials
cat > ~/.aws/credentials <<EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
EOF

# Login to S3 backend
pulumi login "s3://your-bucket/pulumi?endpoint=your-endpoint"
```

---

## Environment Setup

### Configuration Files Overview

The infrastructure uses three Pulumi stacks, each with its own configuration:

```
layer_1/Pulumi.layer_1.yaml    - Layer 1 config
layer_2/Pulumi.layer_2.yaml    - Layer 2 config
platform/Pulumi.prod.yaml      - Platform config
```

### Layer 1 Configuration

```bash
cd layer_1

# Select or create stack
pulumi stack select layer_1
# If stack doesn't exist:
# pulumi stack init layer_1

# Configure hostname
pulumi config set hostname sprocket.mlesports.gg
# For local development:
# pulumi config set hostname localhost

# Configure PostgreSQL connection (from Digital Ocean)
pulumi config set postgres-host sprocketbot-postgres-XXXXX-do-user-XXXXX-0.j.db.ondigitalocean.com
pulumi config set postgres-port 25060

# Configure Vault S3 backend (from Digital Ocean Spaces)
pulumi config set vault-s3-bucket vault-secrets
pulumi config set vault-s3-endpoint https://nyc3.digitaloceanspaces.com
pulumi config set --secret vault-s3-access-key DO004ZHPV38R8C9Q46XG
pulumi config set --secret vault-s3-secret-key YOUR_SECRET_KEY_HERE

# Configure Docker Hub access (for private images)
pulumi config set docker-username asaxplayinghorse
pulumi config set --secret docker-access-token YOUR_DOCKER_TOKEN_HERE

# Configure PostgreSQL password
pulumi config set --secret postgres-password YOUR_DB_PASSWORD_HERE

# View configuration
pulumi config
```

**Expected Output**:
```yaml
KEY                      VALUE
hostname                 sprocket.mlesports.gg
postgres-host            sprocketbot-postgres-...
postgres-port            25060
vault-s3-bucket          vault-secrets
vault-s3-endpoint        https://nyc3.digitaloceanspaces.com
vault-s3-access-key      [secret]
vault-s3-secret-key      [secret]
docker-username          asaxplayinghorse
docker-access-token      [secret]
postgres-password        [secret]
```

### Layer 2 Configuration

```bash
cd ../layer_2

# Select or create stack
pulumi stack select layer_2
# If doesn't exist:
# pulumi stack init layer_2

# Configure hostname (must match Layer 1)
pulumi config set hostname sprocket.mlesports.gg

# Configure PostgreSQL (must match Layer 1)
pulumi config set postgres-host sprocketbot-postgres-XXXXX-do-user-XXXXX-0.j.db.ondigitalocean.com

# Configure S3 endpoint for applications
pulumi config set s3-endpoint nyc3.digitaloceanspaces.com

# View configuration
pulumi config
```

### Platform Configuration

```bash
cd ../platform

# Select or create stack
pulumi stack select prod
# If doesn't exist:
# pulumi stack init prod

# Configure hostname (must match Layer 1 & 2)
pulumi config set hostname sprocket.mlesports.gg

# Configure subdomain (environment name)
pulumi config set subdomain main

# Configure image tag (Docker image version to deploy)
pulumi config set image-tag main

# Configure PostgreSQL (must match Layer 1 & 2)
pulumi config set postgres-host sprocketbot-postgres-XXXXX-do-user-XXXXX-0.j.db.ondigitalocean.com

# Optional: For local development, add IP-based access
# pulumi config set server-ip 192.168.4.39
# pulumi config set tailscale-ip 100.110.185.84

# View configuration
pulumi config
```

---

## Layer 1 Deployment

### Step 1: Deploy Layer 1

**Purpose**: Deploy core infrastructure (Traefik, Vault, Socket Proxy)

```bash
cd layer_1

# Preview changes
pulumi preview

# Expected output:
# + traefik-d3127fd
# + vault-service
# + socket-proxy
# + traefik-ingress network
# + vault-network
# + 3 configs, 2 volumes

# Deploy
pulumi up

# Confirm when prompted:
# Do you want to perform this update? yes
```

**Expected Duration**: 2-5 minutes

**Success Indicators**:
```
Updating (layer_1)

     Type                     Name              Status
 +   pulumi:pulumi:Stack      layer_1-layer_1   created
 +   ├─ docker:index:Network  traefik-network   created
 +   ├─ docker:index:Network  vault-network     created
 +   ├─ docker:index:Volume   traefik-data      created
 +   ├─ docker:index:Service  traefik           created
 +   ├─ docker:index:Service  vault             created
 +   └─ docker:index:Service  socket-proxy      created

Resources:
    + 7 created

Duration: 3m15s
```

### Step 2: Verify Layer 1 Deployment

```bash
# Check services are running
docker service ls

# Expected output:
# ID             NAME            MODE         REPLICAS   IMAGE
# abc123...      traefik-...     replicated   1/1        traefik:v2.6.1
# def456...      vault-service   replicated   1/1        vault:1.10.0
# ghi789...      socket-proxy    replicated   1/1        tecnativa/docker-socket-proxy

# Check Traefik is accessible
curl -I http://localhost:80
# HTTP/1.1 404 (404 is expected - no routes configured yet)

curl -k -I https://localhost:443
# HTTP/2 404

# Check Vault is accessible
curl -k https://localhost/vault
# Or if using proper domain:
# curl https://vault.sprocket.mlesports.gg
```

### Step 3: Vault Initialization

**Check Vault Status**:
```bash
# Get Vault container
VAULT_CONTAINER=$(docker ps -q -f name=vault)

# Check Vault logs
docker logs $VAULT_CONTAINER

# Should see:
# "Vault initialized"
# "Vault unsealed"
```

**Locate Unseal Keys**:
```bash
# Unseal keys are stored at:
cat global/services/vault/unseal-tokens/unseal_tokens.txt

# Save these keys securely!
# You'll need them if you ever need to manually unseal Vault
```

**Get Root Token**:
```bash
# Extract root token
cat global/services/vault/unseal-tokens/root_token.txt

# Or from unseal_tokens.txt:
grep 'Initial Root Token' global/services/vault/unseal-tokens/unseal_tokens.txt
```

**Set Vault Environment Variables**:
```bash
# For production
export VAULT_ADDR=https://vault.sprocket.mlesports.gg

# For local development
# export VAULT_ADDR=http://vault.localhost

# Set root token
export VAULT_TOKEN=$(cat global/services/vault/unseal-tokens/root_token.txt)

# Verify Vault access
vault status

# Expected output:
# Sealed: false
# Key Shares: 5
# Key Threshold: 3
# Initialized: true
```

**Common Vault Issues**:

**Issue**: Vault is sealed
```bash
# Check status
vault status
# Sealed: true

# Unseal manually
vault operator unseal
# Enter first unseal key from unseal_tokens.txt
# Repeat 2 more times with different keys
```

**Issue**: Can't connect to Vault
```bash
# Check service is running
docker service ps vault-service

# Check logs
docker service logs vault-service

# Verify network
docker network inspect traefik-ingress
# Should show vault service connected
```

---

## Secret Provisioning

### Step 1: Prepare Secrets from Doppler

```bash
cd scripts

# Login to Doppler (if not already)
doppler login

# Select correct project/config
doppler setup

# Export secrets to environment
eval $(doppler secrets download --no-file --format env-no-quotes)

# Verify exports
echo $GOOGLE_CLIENT_ID  # Should show value
echo $DISCORD_CLIENT_ID  # Should show value
```

### Step 2: Run Bootstrap Script

**Purpose**: Provision secrets from Doppler into Vault

```bash
# Ensure Vault environment variables are set
export VAULT_ADDR=https://vault.sprocket.mlesports.gg  # or http://vault.localhost
export VAULT_TOKEN=$(cat ../global/services/vault/unseal-tokens/root_token.txt)

# Run bootstrap script
./bootstrap-vault-secrets.sh
```

**Expected Output**:
```
Bootstrapping Vault secrets for environment: sprocket
Vault address: https://vault.sprocket.mlesports.gg

Checking required environment variables...
✓ All required environment variables are set!

Creating secrets in Vault...

Creating/updating secret at: platform/sprocket/manual/oauth/google
✓ Successfully created/updated: platform/sprocket/manual/oauth/google

Creating/updating secret at: platform/sprocket/manual/oauth/discord
✓ Successfully created/updated: platform/sprocket/manual/oauth/discord

Creating/updating secret at: platform/sprocket/manual/oauth/epic
✓ Successfully created/updated: platform/sprocket/manual/oauth/epic

Creating/updating secret at: platform/sprocket/manual/oauth/steam
✓ Successfully created/updated: platform/sprocket/manual/oauth/steam

Creating/updating secret at: platform/ballchasing
✓ Successfully created/updated: platform/ballchasing

Creating/updating secret at: platform/sprocket/chatwoot
✓ Successfully created/updated: platform/sprocket/chatwoot

Creating/updating secret at: infrastructure/data/minio/root
✓ Successfully created/updated: infrastructure/data/minio/root

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All secrets have been successfully bootstrapped!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Verify Secrets

```bash
# Verify secrets were created
vault kv get platform/sprocket/manual/oauth/google
# Should show clientId and clientSecret

vault kv get platform/sprocket/manual/oauth/discord
# Should show client_id and client_secret

vault kv get platform/ballchasing
# Should show token

# List all secrets
vault kv list platform/sprocket/manual/oauth
# Should show: discord, epic, google, steam
```

**Common Issues**:

**Issue**: `Error making API request... 403 Forbidden`
```bash
# Your Vault token doesn't have permission
# Use root token:
export VAULT_TOKEN=$(cat ../global/services/vault/unseal-tokens/root_token.txt)

# Or create a policy with appropriate permissions
```

**Issue**: Missing environment variable
```bash
# Check which variable is missing from error message
# Export from Doppler again:
eval $(doppler secrets download --no-file --format env-no-quotes)

# Or manually export:
export GOOGLE_CLIENT_ID="your-value-here"
```

---

## Layer 2 Deployment

### Step 1: Deploy Layer 2

**Purpose**: Deploy data services (Redis, RabbitMQ, InfluxDB, etc.)

```bash
cd ../layer_2

# Preview changes
pulumi preview

# Expected resources:
# + Redis service
# + RabbitMQ service
# + InfluxDB service
# + Grafana service
# + N8n service
# + Neo4j service
# + Gatus service
# + Loki service
# + Telegraf service
# + Vault policies
# + Multiple networks, volumes, configs

# Deploy
pulumi up
```

**Expected Duration**: 3-7 minutes

**Success Indicators**:
```
Updating (layer_2)

     Type                              Name                 Status
 +   pulumi:pulumi:Stack               layer_2-layer_2      created
 +   ├─ SprocketBot:Services:Redis     layer2redis          created
 +   ├─ SprocketBot:Services:RabbitMQ  rabbitmq             created
 +   ├─ SprocketBot:Services:InfluxDB  influx               created
 +   ├─ SprocketBot:Services:Grafana   grafana              created
 +   ├─ SprocketBot:Services:N8n       n8n                  created
 +   ├─ SprocketBot:Services:Neo4j     neo4j                created
 +   ├─ SprocketBot:Services:Gatus     gatus-internal       created
 +   └─ ... (additional resources)

Resources:
    + 25 created

Duration: 5m42s
```

### Step 2: Verify Layer 2 Deployment

```bash
# Check all services are running
docker service ls | grep layer_2

# Expected output (similar to):
# layer2redis-...        replicated   1/1        redis:6-alpine
# rabbitmq-...           replicated   1/1        rabbitmq:3-management
# influx-...             replicated   1/1        influxdb:2.7
# grafana-...            replicated   1/1        grafana/grafana
# ...

# Check service health
docker service ps layer2redis-redis-primary
# Should show "Running" state

# Check logs for errors
docker service logs layer2redis-redis-primary --tail 50
# Should show successful startup
```

### Step 3: Test Layer 2 Services

**Redis**:
```bash
# Get Redis container
REDIS_CONTAINER=$(docker ps -q -f name=layer2redis)

# Test Redis connection
docker exec $REDIS_CONTAINER redis-cli ping
# Expected: PONG

# Test with auth (if password configured)
REDIS_PASSWORD=$(vault kv get -field=password infrastructure/data/redis)
docker exec $REDIS_CONTAINER redis-cli -a $REDIS_PASSWORD ping
```

**RabbitMQ**:
```bash
# Access RabbitMQ management UI (if exposed)
# https://rabbitmq.sprocket.mlesports.gg
# Or check via API
curl -k https://localhost/rabbitmq/api/overview
```

**InfluxDB**:
```bash
# Access InfluxDB UI (if exposed)
# https://influx.sprocket.mlesports.gg

# Or check health
INFLUX_CONTAINER=$(docker ps -q -f name=influx)
docker exec $INFLUX_CONTAINER influx ping
```

---

## Platform Deployment

### Step 1: Deploy Platform

**Purpose**: Deploy application services (web, API, Discord bot, microservices)

```bash
cd ../platform

# Preview changes
pulumi preview

# Expected resources:
# + Sprocket Web service
# + Sprocket API service
# + Discord Bot service
# + Image Generation services (frontend + backend)
# + Multiple microservices (notification, analytics, matchmaking, etc.)
# + Platform network
# + Multiple secrets, configs

# Deploy
pulumi up
```

**Expected Duration**: 5-10 minutes

**Success Indicators**:
```
Updating (prod)

     Type                                   Name                        Status
 +   pulumi:pulumi:Stack                    platform-prod               created
 +   ├─ SprocketBot:Platform                prod                        created
 +   │  ├─ SprocketBot:Service              prod-sprocket-web           created
 +   │  ├─ SprocketBot:Service              prod-sprocket-core          created
 +   │  ├─ SprocketBot:Service              prod-discord-bot            created
 +   │  ├─ SprocketBot:Service              prod-image-generation       created
 +   │  ├─ SprocketBot:Service              prod-notification-service   created
 +   │  └─ ... (additional services)

Resources:
    + 35 created

Duration: 8m23s
```

### Step 2: Verify Platform Deployment

```bash
# Check all platform services are running
docker service ls | grep prod

# Expected output:
# prod-sprocket-web-service                 replicated   1/1   asaxplayinghorse/sprocket-web:main
# prod-sprocket-core-service                replicated   1/1   asaxplayinghorse/sprocket-core:main
# prod-discord-bot-service                  replicated   1/1   asaxplayinghorse/sprocket-discord-bot:main
# ...

# Check specific service status
docker service ps prod-sprocket-web-service

# Should show:
# ID             NAME                     IMAGE                              NODE      DESIRED STATE   CURRENT STATE
# abc123...      prod-sprocket-web...     asaxplayinghorse/sprocket-web...   node1     Running         Running 2 minutes ago
```

### Step 3: Monitor Service Startup

Services may take several minutes to fully start. Monitor logs:

```bash
# Watch web service logs
docker service logs -f prod-sprocket-web-service

# Watch API service logs
docker service logs -f prod-sprocket-core-service

# Watch Discord bot logs
docker service logs -f prod-discord-bot-service
```

**Successful Startup Indicators**:

**Web Service**:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO Server listening on port 3000
```

**API Service**:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [GraphQLModule] Mapped {/graphql, POST} route
[Nest] INFO Database connection established
[Nest] INFO Server listening on port 3001
```

**Discord Bot**:
```
INFO: Discord bot logged in as SprocketBot#1234
INFO: Connected to Discord gateway
INFO: Ready to receive commands
```

---

## Verification

### Automated Verification

```bash
# Run quick test script
./quick-test.sh

# Run comprehensive verification
./verify-deployment.sh
```

**Expected Output** (quick-test.sh):
```
=== Quick Sprocket Deployment Test ===

Testing Traefik on port 80... OK (HTTP 301)
Testing Traefik on port 443... OK (HTTP 200)
Checking DNS for sprocket.mlesports.gg... Resolves to 127.0.0.1
Checking web service container... Running (abc123...)
Checking Traefik router for web service... Router configured

=== Summary ===
Services are configured! Access at:
  http://sprocket.mlesports.gg
  https://sprocket.mlesports.gg
```

### Manual Verification

#### 1. Test HTTP→HTTPS Redirect

```bash
curl -I http://sprocket.mlesports.gg

# Expected output:
# HTTP/1.1 301 Moved Permanently
# Location: https://sprocket.mlesports.gg/
```

#### 2. Test HTTPS Access

```bash
curl -I https://sprocket.mlesports.gg

# Expected output:
# HTTP/2 200
# content-type: text/html
# ... (headers)
```

#### 3. Test API Endpoint

```bash
curl -X POST https://api.sprocket.mlesports.gg/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# Expected: GraphQL schema response (JSON)
```

#### 4. Test Service Discovery

```bash
# Check Traefik router configuration
TRAEFIK_CONTAINER=$(docker ps -q -f name=traefik)
docker exec $TRAEFIK_CONTAINER wget -qO- http://localhost:8080/api/http/routers | jq

# Should show routers for:
# - sprocket-web
# - sprocket-core (API)
# - image-generation
# - vault
# - traefik dashboard
```

#### 5. Test Database Connectivity

```bash
# From API service container
API_CONTAINER=$(docker ps -q -f name=prod-sprocket-core)

docker exec $API_CONTAINER node -e "
const pg = require('pg');
const client = new pg.Client({
  host: 'sprocketbot-postgres-...',
  port: 25060,
  database: 'defaultdb',
  user: 'doadmin',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => console.log('✓ Database connected'))
  .catch(err => console.error('✗ Database error:', err.message));
"
```

#### 6. Test S3 Storage

```bash
# Test S3 connectivity
aws s3 ls --endpoint-url https://nyc3.digitaloceanspaces.com s3://sprocket-storage/

# Or using aws-cli in a service container
docker exec $API_CONTAINER aws s3 ls s3://sprocket-storage/ --endpoint-url https://nyc3.digitaloceanspaces.com
```

#### 7. Browser Tests

**Web UI**:
- Navigate to https://sprocket.mlesports.gg
- Should see Sprocket homepage
- Try logging in with Google/Discord OAuth

**Traefik Dashboard**:
- Navigate to https://traefik.sprocket.mlesports.gg
- Should see Traefik dashboard (requires auth)
- Check routers, services, middleware

**Vault UI**:
- Navigate to https://vault.sprocket.mlesports.gg
- Should see Vault login page
- Can login with GitHub OAuth or root token

**Grafana (Unified Logs & Metrics)**:
- Navigate to https://grafana.sprocket.mlesports.gg
- Should see Grafana login
- Default credentials (if not changed): admin/admin
- **Unified Interface**: Access both metrics (InfluxDB/Telegraf) and logs (Loki) from single dashboard
- Use **Explore** view to query logs with LogQL: `{service="prod-sprocket-core-service"} |= "ERROR"`
- Use **Dashboards** to view real-time metrics and system health

#### 8. Direct Master Node Access (Advanced Debugging)

For low-level debugging, you can access the Digital Ocean master node directly:

**Via Digital Ocean Console**:
1. Log into https://cloud.digitalocean.com
2. Navigate to: Droplets → Select your droplet
3. Click "Console" (web-based SSH terminal)
4. Login and run debugging commands:
   ```bash
   docker service ls              # List all services
   docker service logs <service>  # View service logs
   docker stats --no-stream       # Check resource usage
   docker system df               # Check disk usage
   ```

**Via SSH**:
```bash
ssh root@<droplet-ip>
# Or with key: ssh -i ~/.ssh/your-key root@<droplet-ip>
```

**Common Debugging Commands**:
```bash
# Exec into a running container
CONTAINER_ID=$(docker ps -q -f name=prod-sprocket-core)
docker exec -it $CONTAINER_ID sh

# Check system resources
df -h                  # Disk usage
free -h                # Memory usage
docker system df       # Docker storage

# Network debugging
docker network inspect traefik-ingress
nslookup vault.sprocket.mlesports.gg
```

See [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md#digital-ocean-master-node-access-for-debugging) for detailed debugging procedures.

---

## Troubleshooting

### Common Issues

#### Issue 1: Services Not Starting

**Symptoms**:
```bash
docker service ls
# Shows 0/1 replicas
```

**Diagnosis**:
```bash
# Check service status
docker service ps <service-name> --no-trunc

# Common failure reasons:
# - Image pull failure
# - Resource constraints
# - Health check failure
# - Configuration error
```

**Solutions**:

**Image Pull Failure**:
```bash
# Check Docker Hub authentication
docker login
# Enter credentials

# Verify image exists
docker pull asaxplayinghorse/sprocket-web:main

# Update service
docker service update --force <service-name>
```

**Resource Constraints**:
```bash
# Check node resources
docker node ls
docker node inspect self | jq '.[0].Description.Resources'

# Check running containers
docker stats --no-stream

# If low on resources:
# - Scale down non-critical services
# - Upgrade node (more CPU/RAM)
# - Add more nodes to swarm
```

**Health Check Failure**:
```bash
# Check service logs
docker service logs <service-name> --tail 100

# Common causes:
# - Database not accessible
# - Missing secrets
# - Port already in use
# - Dependency not ready
```

#### Issue 2: 404 Not Found

**Symptoms**:
```bash
curl https://sprocket.mlesports.gg
# HTTP/2 404
```

**Diagnosis**:
```bash
# Check Traefik routers
TRAEFIK_CONTAINER=$(docker ps -q -f name=traefik)
docker exec $TRAEFIK_CONTAINER wget -qO- http://localhost:8080/api/http/routers | jq '.[] | select(.rule | contains("sprocket"))'

# Should show router with rule matching your domain
```

**Solutions**:

**Router Not Found**:
```bash
# Check service labels
docker service inspect prod-sprocket-web-service | jq '.[0].Spec.TaskTemplate.ContainerSpec.Labels'

# Should include Traefik labels like:
# "traefik.enable": "true"
# "traefik.http.routers.sprocket-web.rule": "Host(`sprocket.mlesports.gg`)"

# If missing, service needs to be redeployed
cd platform
pulumi up
```

**Wrong Hostname**:
```bash
# Check Pulumi config
pulumi config get hostname
# Should match your domain

# Update if wrong
pulumi config set hostname sprocket.mlesports.gg
pulumi up
```

**Orphaned Service Tasks**:
```bash
# Sometimes old service versions linger
docker service update --force prod-sprocket-web-service

# Or recreate service
cd platform
pulumi destroy --target <service-resource>
pulumi up
```

#### Issue 3: Certificate Errors

**Symptoms**:
```bash
curl https://sprocket.mlesports.gg
# SSL certificate problem: unable to get local issuer certificate
```

**Diagnosis**:
```bash
# Check certificate issuer
echo | openssl s_client -connect sprocket.mlesports.gg:443 -servername sprocket.mlesports.gg 2>/dev/null | openssl x509 -noout -issuer

# Should show:
# issuer=C=US, O=Let's Encrypt, CN=R3

# If shows "TRAEFIK DEFAULT CERT":
# - Let's Encrypt hasn't issued cert yet
# - DNS not pointing to server
# - Let's Encrypt rate limited
```

**Solutions**:

**DNS Not Configured**:
```bash
# Verify DNS
nslookup sprocket.mlesports.gg
# Should return your server IP

# If not, update DNS records
# Wait 5-10 minutes for propagation
```

**Let's Encrypt Rate Limited**:
```bash
# Check Traefik logs
docker service logs traefik-... | grep -i "acme\|letsencrypt"

# If rate limited:
# - Wait 1 hour (soft limit resets)
# - Use staging environment temporarily
# - Check you're not requesting too many certs
```

**Firewall Blocking Port 80**:
```bash
# Let's Encrypt HTTP-01 challenge needs port 80
# Check firewall
sudo ufw status

# Should show:
# 80/tcp ALLOW

# If blocked:
sudo ufw allow 80/tcp
```

#### Issue 4: Vault Sealed

**Symptoms**:
```bash
vault status
# Sealed: true
```

**Solution**:
```bash
# Unseal Vault manually
vault operator unseal
# Enter first unseal key from unseal_tokens.txt

vault operator unseal
# Enter second unseal key

vault operator unseal
# Enter third unseal key

# Check status
vault status
# Sealed: false
```

**Prevent Future Sealing**:
```bash
# Check auto-unseal script
cat global/services/vault/scripts/auto-initialize.sh

# Verify bind mount is working
docker service inspect vault-service | jq '.[0].Spec.TaskTemplate.ContainerSpec.Mounts'

# Should show:
# {
#   "Type": "bind",
#   "Source": "/root/sprocket-infra/global/services/vault/unseal-tokens",
#   "Target": "/vault/unseal-tokens"
# }
```

#### Issue 5: Database Connection Failed

**Symptoms**:
```bash
# Service logs show:
# Error: connect ECONNREFUSED
# Or: FATAL: password authentication failed
```

**Solutions**:

**Check Connection Details**:
```bash
# Verify Pulumi config
cd layer_1
pulumi config get postgres-host
pulumi config get postgres-port

# Should match Digital Ocean connection info
```

**Check Password**:
```bash
# Password should be in Pulumi config
pulumi config get postgres-password --show-secrets

# Or in Vault
vault kv get infrastructure/data/postgres
```

**Test Connection from Node**:
```bash
# Install PostgreSQL client
sudo apt-get install postgresql-client

# Test connection
PGPASSWORD='your-password' psql -h sprocketbot-postgres-... -p 25060 -U doadmin -d defaultdb

# If successful, connection details are correct
# If fails, check:
# - IP whitelist on Digital Ocean
# - Network connectivity
# - Password
```

**Update IP Whitelist**:
```bash
# In Digital Ocean console:
# 1. Go to your database
# 2. Settings → Trusted Sources
# 3. Add your production node IP
# 4. Save
```

---

## Rollback Procedures

### Rollback Platform

```bash
cd platform

# Export current state (backup)
pulumi stack export > backup-platform-$(date +%Y%m%d-%H%M%S).json

# Preview destroy
pulumi destroy --preview

# Destroy platform
pulumi destroy

# Or rollback to previous state
pulumi stack import < backup-platform-TIMESTAMP.json
pulumi up
```

### Rollback Layer 2

```bash
cd layer_2

# Export state
pulumi stack export > backup-layer2-$(date +%Y%m%d-%H%M%S).json

# Destroy
pulumi destroy
```

⚠️ **Warning**: Destroying Layer 2 will delete data services. Ensure backups exist!

### Rollback Layer 1

```bash
cd layer_1

# Export state
pulumi stack export > backup-layer1-$(date +%Y%m%d-%H%M%S).json

# Destroy
pulumi destroy
```

⚠️ **Warning**: Destroying Layer 1 will make entire platform inaccessible!

### Emergency Rollback

**If deployment is completely broken:**

```bash
# Stop all services
docker service rm $(docker service ls -q)

# Clean up networks
docker network prune -f

# Clean up volumes (⚠️ DELETES DATA!)
docker volume prune -f

# Start fresh deployment
cd layer_1 && pulumi up
cd ../layer_2 && pulumi up
cd ../platform && pulumi up
```

---

## Post-Deployment

### Security Checklist

- [ ] Change default passwords (Grafana, etc.)
- [ ] Rotate Vault root token
- [ ] Enable Vault audit logging
- [ ] Configure firewall rules
- [ ] Set up SSL certificate monitoring
- [ ] Review service logs for errors
- [ ] Test disaster recovery procedure

### Monitoring Setup

- [ ] Configure Grafana dashboards
- [ ] Set up alerting (PagerDuty, etc.)
- [ ] Configure log retention (Loki)
- [ ] Set up uptime monitoring (Gatus)
- [ ] Enable metric collection (Telegraf)

### Backup Setup

- [ ] Configure automated database backups
- [ ] Test database restore
- [ ] Document Vault recovery procedure
- [ ] Export Pulumi state regularly
- [ ] Store secrets backup securely

---

## Next Steps

After successful deployment:

1. **Test Application Functionality**
   - User registration
   - OAuth login
   - API queries
   - Discord bot commands

2. **Performance Tuning**
   - Monitor resource usage
   - Optimize database queries
   - Configure caching
   - Adjust service replicas if needed

3. **Documentation**
   - Document custom configurations
   - Create runbooks for common operations
   - Update team wiki

4. **Team Onboarding**
   - Share access credentials
   - Provide architecture overview
   - Conduct deployment walkthrough

---

**Deployment Complete!** 🎉

Your Sprocket infrastructure is now live and serving users.

For operational procedures, see [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md).

For troubleshooting, see the [Troubleshooting](#troubleshooting) section above or [TECHNICAL_CHALLENGES.md](./TECHNICAL_CHALLENGES.md).

---

**Document Version**: 1.1
**Last Updated**: December 4, 2025
**Maintained By**: Infrastructure Team
