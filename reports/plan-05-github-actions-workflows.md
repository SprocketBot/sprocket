# Plan 05: GitHub Actions CD Workflows

**Status**: Not started
**Depends on**: Plans 01–04 (all prerequisites must be complete before this workflow is live in prod)
**Sprocket repo**: Infrastructure code now lives inside the main `sprocket` repository

## Context

Two workflows are needed:
1. **`deploy.yml`** — triggered on push to `main`; builds, pushes, and promotes images through dev → staging → prod
2. **`rollback.yml`** — manually triggered; redeploys a specified commit SHA to a specified environment

A third workflow stub for drift detection is covered in Plan 02 (A5).

The workflows call the Pulumi Automation API entrypoint (`automation/deploy.ts`) rather than invoking `pulumi up` directly — this keeps deployment logic in the codebase, not embedded in YAML.

---

## Manual Steps

### M1 — Configure GitHub Actions environment protection rules
In the GitHub repo settings under **Environments**:
- Create environments: `dev`, `staging`, `prod`
- On `prod`: enable **Required reviewers** and add at least one approver
- On `prod`: set a **wait timer** (e.g., 5 minutes) to allow for last-minute abort
- On `staging`: no required reviewer, but enable **deployment branch restriction** to `main` only

### M2 — Add all required secrets to GitHub
Ensure these are present in the repo (or org-level) secrets:

| Secret | Purpose |
|---|---|
| `GITHUB_TOKEN` | Built-in; used for GHCR push |
| `PULUMI_ACCESS_TOKEN` | Pulumi Cloud authentication |
| `DEV_STAGING_NODE_IP` | SSH target for dev/staging Automation API runner |
| `PROD_NODE_IP` | SSH target for prod Automation API runner |
| `NODE_SSH_KEY` | Private key for SSH access to both nodes (or separate keys) |

### M3 — Review and approve the first prod deployment manually
The first time `deploy.yml` runs end-to-end, watch it complete dev and staging stages before approving the prod gate. Don't approve blindly — verify staging health signals before clicking approve.

---

## Agent Steps

### A1 — Create `deploy.yml`

Create `.github/workflows/deploy.yml` in the main `sprocket` repository:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    name: Build & Push Images
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.sha }}
    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set image tag
        id: meta
        run: echo "sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Build and push all services
        run: |
          # Repeat per service — or use a matrix strategy (see A2)
          docker build ./services/my-service -t ghcr.io/<org>/my-service:${{ steps.meta.outputs.sha }}
          docker push ghcr.io/<org>/my-service:${{ steps.meta.outputs.sha }}

  deploy-dev:
    name: Deploy → Dev
    needs: build
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: automation
      - name: Deploy to dev
        run: npx ts-node automation/deploy.ts --stack dev-staging --env dev --image-tag ${{ needs.build.outputs.image-tag }}
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
      - name: Health check soak (dev)
        run: |
          sleep 30
          ./scripts/health-check.sh dev ${{ secrets.DEV_STAGING_NODE_IP }}

  deploy-staging:
    name: Deploy → Staging
    needs: [build, deploy-dev]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: automation
      - name: Deploy to staging
        run: npx ts-node automation/deploy.ts --stack dev-staging --env staging --image-tag ${{ needs.build.outputs.image-tag }}
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
      - name: Health check soak (staging)
        run: |
          sleep 300  # 5-minute soak
          ./scripts/health-check.sh staging ${{ secrets.DEV_STAGING_NODE_IP }}

  deploy-prod:
    name: Deploy → Prod
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment: prod  # manual approval gate configured in M1
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: automation
      - name: Deploy to prod
        run: npx ts-node automation/deploy.ts --stack prod --env prod --image-tag ${{ needs.build.outputs.image-tag }}
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
      - name: Health check soak (prod)
        run: |
          sleep 600  # 10-minute soak
          ./scripts/health-check.sh prod ${{ secrets.PROD_NODE_IP }}
```

### A2 — Refactor build job to use a matrix strategy
If the 7 services are built independently (recommended for per-service promotion), convert the build job to a matrix:

```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [service-a, service-b, service-c, service-d, service-e, service-f, python-service]
    steps:
      - name: Build and push ${{ matrix.service }}
        run: |
          docker build ./services/${{ matrix.service }} \
            -t ghcr.io/<org>/${{ matrix.service }}:${{ steps.meta.outputs.sha }}
          docker push ghcr.io/<org>/${{ matrix.service }}:${{ steps.meta.outputs.sha }}
```

Note: per-service promotion (where each service can be at a different version in each environment) requires the Automation API to accept per-service image tag overrides in config. This is a design extension deferred until the base pipeline is working.

### A3 — Create `rollback.yml`

Create `.github/workflows/rollback.yml`:

```yaml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options: [dev, staging, prod]
      commit-sha:
        description: 'Commit SHA to roll back to (short or full)'
        required: true
      service:
        description: 'Service name (leave blank to rollback all services)'
        required: false

jobs:
  rollback:
    name: Rollback ${{ inputs.environment }} to ${{ inputs.commit-sha }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}  # triggers approval for prod rollbacks too
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: automation
      - name: Rollback
        run: |
          npx ts-node automation/deploy.ts \
            --stack ${{ inputs.environment == 'prod' && 'prod' || 'dev-staging' }} \
            --env ${{ inputs.environment }} \
            --image-tag ${{ inputs.commit-sha }} \
            ${{ inputs.service && format('--service {0}', inputs.service) || '' }}
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
```

### A4 — Create `scripts/health-check.sh`

Create `scripts/health-check.sh` — called by both `deploy.yml` and `rollback.yml` after each deployment:

```bash
#!/usr/bin/env bash
set -euo pipefail

ENV=$1
NODE_IP=$2

SERVICES=(service-a service-b service-c service-d service-e service-f python-service)

for SERVICE in "${SERVICES[@]}"; do
  URL="http://${NODE_IP}/healthz"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Host: ${SERVICE}.${ENV}.sprocket.internal" "$URL")

  if [ "$HTTP_STATUS" != "200" ]; then
    echo "FAIL: $SERVICE returned $HTTP_STATUS"
    exit 1
  fi
  echo "OK: $SERVICE"
done
```

Make executable: `chmod +x scripts/health-check.sh`.

### A5 — Add workflow status badges to the Sprocket repo README
In `README.md`, add GitHub Actions badges for the deploy and rollback workflows so current pipeline status is visible at a glance.

---

## Validation Checklist

- [ ] `deploy.yml` triggers on push to `main` and completes all three stages without error
- [ ] A deliberate bad commit (e.g., service exits immediately) causes Swarm to auto-rollback and the pipeline to halt at the dev stage (not reach staging or prod)
- [ ] `rollback.yml` successfully redeploys a known-good SHA to staging
- [ ] `rollback.yml` to prod requires and waits for manual approval
- [ ] `health-check.sh` exits non-zero when a service is down, and the pipeline correctly marks the step as failed
- [ ] No `latest` image tag appears in any Pulumi stack state after a successful deploy

## Tags

#project #sprocket #cd #github-actions #pulumi #automation
