# Plan 02: Pulumi Stack Refactor

**Status**: Not started
**Prerequisite for**: Plan 03 (dev/staging node), Plan 05 (GitHub Actions workflows)
**Sprocket repo**: Infrastructure code now lives inside the main `sprocket` repository

## Context

Currently there are three intertwined Pulumi programs with drift and duplication. The target layout is:

| Stack | Project | Purpose |
|---|---|---|
| `shared-infra` | `infra-shared` | DigitalOcean Droplets, firewalls, DNS, bootstrap templates, shared secrets, registry config |
| `dev-staging` | `infra-services` | Application services, parameterized for dev+staging |
| `prod` | `infra-services` | Application services, production config |

The `infra-services` project must be a single Pulumi program that accepts environment config — not three separate copies of service definitions.

This plan now includes the host foundation layer, not just the service layer. The desired end state is that node creation is Pulumi-managed and first-boot host setup is encoded as cloud-init or user-data rather than an SSH checklist.

---

## Manual Steps

### M1 — Create Pulumi Cloud stacks
In the Pulumi Cloud console (or via CLI), create the new stacks:
```sh
cd infra-shared && pulumi stack init shared-infra
cd ../infra-services && pulumi stack init dev-staging
cd ../infra-services && pulumi stack init prod
```
If migrating state from existing stacks, use `pulumi stack export` / `pulumi stack import` rather than recreating resources.

### M2 — Migrate existing state (critical — do not skip)
Before destroying old stacks:
- Export state from each existing Pulumi stack: `pulumi stack export --file <stack>.json`
- Store these exports in a safe location (not the repo — they may contain secrets)
- Only delete the old stacks after the new ones are verified running

### M3 — Set environment-specific Pulumi config values
For each new stack, set config values that differ per environment. Example:
```sh
pulumi config set --stack dev-staging imageTag dev-latest
pulumi config set --stack dev-staging replicaCount 1
pulumi config set --stack prod imageTag ""  # populated by CD pipeline per deploy
pulumi config set --stack prod replicaCount 2
```
Resource limits, replica counts, log levels, and feature flags all belong here.

### M4 — Store secrets in Pulumi config (encrypted)
Use `pulumi config set --secret` for any values that are currently hardcoded or stored in plaintext config:
```sh
pulumi config set --secret --stack prod databaseUrl "postgresql://..."
```

### M5 — Register DigitalOcean prerequisites
Before creating foundation resources, ensure Pulumi has access to:
- a DigitalOcean API token
- the SSH key IDs or fingerprints to attach to Droplets
- the DNS zone / domain information for environment hostnames

Store these as encrypted Pulumi config or provider config, not as hardcoded values in code.

### M6 — Add Pulumi Cloud access token to GitHub secrets
For the Automation API runner in GitHub Actions to authenticate:
- Generate a Pulumi Cloud API token (org-scoped, not personal)
- Store as `PULUMI_ACCESS_TOKEN` in the GitHub repo secrets

---

## Agent Steps

These can be executed by an agent working in the infrastructure code inside the main `sprocket` repository.

### A1 — Audit the existing Pulumi programs
Catalog all three current programs:
- List every resource type defined (Docker services, networks, volumes, secrets, etc.)
- List the host-level resources that exist outside Pulumi today (Droplets, firewalls, DNS, SSH access model, bootstrap state)
- Identify which resources are duplicated across programs
- Identify which resources are foundation infrastructure (Droplets, firewalls, DNS, bootstrap templates), shared infrastructure (networks, Traefik, logging stack), and application services
- Map out inter-program dependencies (stack references, config lookups)

This audit is the input to the refactor — do not proceed to A2 without it.

### A2 — Create `infra-shared` project
Create a new Pulumi TypeScript project at `infra-shared/`:
- Add DigitalOcean Droplet definitions for `dev-staging` and `prod`
- Add DigitalOcean firewall definitions per node role
- Add DNS records for dev, staging, and prod hostnames
- Add SSH key registration / assignment for node access
- Add cloud-init or user-data templates for first-boot host setup
- Extract shared networking resources (Swarm overlay networks)
- Extract Traefik (load balancer / reverse proxy)
- Extract the logging stack (Loki, Grafana, Promtail)
- Extract any shared Docker secrets or configs that all services reference
- Export these as stack outputs so `infra-services` can reference them via `StackReference`

The cloud-init payload should make a fresh node ready for service deployment:
- install Docker
- enable Docker on boot
- initialize Swarm if inactive
- write Docker daemon log rotation config
- prepare GHCR authentication plumbing without hardcoding the credential into source
- create any deploy user / SSH baseline needed by the Automation API runner

### A3 — Create `infra-services` project with environment parameterization
Create a new Pulumi TypeScript project at `infra-services/`:
- Define each of the 7 application services as `docker.Service` resources
- Read all environment-varying values from `pulumi.Config` (image tags, replica counts, resource limits, env vars)
- Reference shared infrastructure and host connection details from `infra-shared` via `pulumi.StackReference`
- Do not hardcode any environment-specific values in code — they must come from config

Example config-driven service pattern:
```typescript
const config = new pulumi.Config();
const imageTag = config.require("imageTag");
const replicaCount = config.requireNumber("replicaCount");

const myService = new docker.Service("my-service", {
    taskSpec: {
        containerSpec: {
            image: `ghcr.io/<org>/my-service:${imageTag}`,
        },
        resources: {
            limits: {
                memoryBytes: config.requireNumber("myServiceMemoryLimit"),
            },
        },
    },
    mode: { replicated: { replicas: replicaCount } },
    updateConfig: {
        parallelism: 1,
        delay: "15s",
        failureAction: "rollback",
        monitor: "30s",
    },
    rollbackConfig: {
        order: "stop-first",
    },
});
```

### A4 — Add Pulumi Automation API entrypoint
Create `automation/deploy.ts` (or `automation/deploy.py` if Python is preferred):
- Accepts arguments: `--stack <stack-name> --image-tag <sha>`
- Runs `pulumi up` against the specified stack with the given image tag injected as config
- Streams output to stdout (for GitHub Actions log capture)
- Exits non-zero on failure (so GitHub Actions marks the step failed)
- Includes a `--preview` flag for dry-run mode

This is the binary that GitHub Actions will invoke — it should not require interactive input. It is intentionally scoped to service deployment and promotion, not Droplet provisioning. Foundation changes should happen in a separate workflow or an operator-driven Pulumi update.

### A5 — Add a `pulumi refresh` drift detection workflow stub
Create `.github/workflows/drift-detection.yml`:
- Runs on a schedule (e.g., daily at 06:00 UTC)
- Calls `pulumi refresh --preview-only` on both `shared-infra` and `prod` stacks
- Fails the workflow if drift is detected, triggering a GitHub notification

### A6 — Add foundation validation for node recreation
Document and test the non-prod rebuild path:
- destroy the `dev-staging` Droplet in a controlled test
- recreate it from `infra-shared`
- confirm cloud-init converges the host into `Swarm: active`
- confirm `infra-services` can redeploy the full dev-staging environment without manual repair

---

## Validation Checklist

- [ ] `pulumi preview --stack shared-infra` shows Droplet, firewall, and DNS resources with no unmanaged prerequisites
- [ ] A fresh `dev-staging` Droplet reaches a bootstrap-complete state from cloud-init alone
- [ ] `pulumi preview --stack dev-staging` runs without error against the new `infra-services` project
- [ ] `pulumi preview --stack prod` produces a diff matching the current prod state (no unintended changes)
- [ ] `pulumi up --stack dev-staging` successfully deploys a test image to the dev/staging node
- [ ] `automation/deploy.ts --stack prod --image-tag <sha> --preview` runs without error from GitHub Actions
- [ ] Destroying and recreating `dev-staging` requires no manual SSH bootstrap steps
- [ ] No resources are orphaned in the old stacks after migration (verify with `pulumi stack --show-urns`)

## Tags

#project #sprocket #cd #pulumi #infra
