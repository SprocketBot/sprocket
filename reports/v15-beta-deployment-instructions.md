# v15-beta Deployment Instructions

Last updated: March 16, 2026

## Prerequisites

- Access to Pulumi backend (S3 bucket)
- SSH access to the target server (192.168.4.39)
- Docker push access to `asaxplayinghorse/monolith` repository

---

## Step 1: Build & Push v15 Docker Image

From the v15 worktree:

```bash
# Navigate to v15 worktree
cd /root/workspace/sprocket-v15

# Build the monolith image
docker build -f dev.Dockerfile \
  --build-arg SERVICE_PATH=apps/monolith \
  -t asaxplayinghorse/monolith:personal-gankoji-unbork-cloud-spend .

# Push to registry
docker push asaxplayinghorse/monolith:personal-gankoji-unbork-cloud-spend
```

---

## Step 2: Create Pulumi Stack

On the target server (or machine with Pulumi access):

```bash
cd ~/sprocket/infra/platform

# Login to Pulumi backend (if not already)
# Check infra/README.md for the backend URL
pulumi login "s3://[your-bucket]/pulumi?endpoint=[your-endpoint]"

# Create the new stack from prod (copies all config/secrets)
pulumi stack init v15-beta

# OR: create empty and copy config from prod
pulumi stack create v15-beta --copy-config-from prod
```

---

## Step 3: Configure v15-beta Stack

Set the v15-specific configuration (non-secrets):

```bash
cd ~/sprocket/infra/platform

# Environment identity
pulumi config set platform:subdomain v15
pulumi config set platform:hostname sprocket.mlesports.gg

# Image configuration  
pulumi config set platform:image-tag personal-gankoji-unbork-cloud-spend

# Monolith mode (runs all services in single container)
pulumi config set platform:monolith-mode true
pulumi config set platform:monolith-image-repository monolith

# Disable unnecessary services
pulumi config set platform:deploy-image-generation-frontend false

# Optional: If you need direct IP access for testing
pulumi config set platform:server-ip <your-server-ip>
pulumi config set platform:tailscale-ip <your-tailscale-ip>
```

Verify the config:
```bash
pulumi config
```

---

## Step 4: Deploy

```bash
cd ~/sprocket/infra/platform

# Point to remote Docker host (if deploying to remote server)
# Option A: SSH tunnel
ssh -L localhost:2377:/var/run/docker.sock user@192.168.4.39
export DOCKER_HOST=tcp://localhost:2377

# Option B: Direct connection (if configured)
export DOCKER_HOST=tcp://192.168.4.39:2375

# Run deployment
pulumi up --stack v15-beta
```

Review the planned changes carefully before confirming. The deployment will:
- Create a new Docker network `sprocket-v15-net`
- Create Redis keys with `v15.` prefix
- Create S3 bucket with `v15-` prefix
- Deploy monolith container with Traefik routes for:
  - Web: `https://v15.sprocket.mlesports.gg`
  - API: `https://api.v15.sprocket.mlesports.gg/graphql`

---

## Step 5: Verify Deployment

After deployment completes, run Tier 0 verification:

```bash
# From main worktree
cd ~/sprocket
npm run verify:tier0 -- v15-beta
```

Expected output:
```
Running Tier 0 for lane 'v15-beta' using /root/workspace/sprocket/scripts/harness/env/v15-beta.env
check-web passed for https://v15.sprocket.mlesports.gg
check-api passed for https://api.v15.sprocket.mlesports.gg/graphql
check-dependencies passed
Tier 0 complete.
```

---

## Rollback

If something goes wrong:

```bash
cd ~/sprocket/infra/platform
pulumi rollback --stack v15-beta
```

Or destroy completely:
```bash
pulumi destroy --stack v15-beta
pulumi stack rm v15-beta
```

---

## Notes

- v15-beta shares infrastructure with v1 (Postgres, Redis, MinIO, RabbitMQ) but uses isolated key prefixes
- The monolith includes all services: core, discord-bot, matchmaking-service, submission-service, etc.
- Database uses the same Postgres instance but should get its own schema (verify in application config)
- For production use, you'll want separate database schema or dedicated database