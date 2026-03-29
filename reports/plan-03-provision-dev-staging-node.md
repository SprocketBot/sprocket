# Plan 03: Provision Dev/Staging Node

**Status**: Not started
**Prerequisite for**: Plan 04 (healthz), Plan 05 (GitHub Actions workflows)
**Depends on**: Plan 02 (Pulumi stack refactor — `infra-shared` must provision the node and `infra-services` must deploy onto it)
**Sprocket repo**: Infrastructure code now lives inside the main `sprocket` repository

## Context

The dev/staging node is a new DigitalOcean Droplet that runs a single-node Docker Swarm. Dev and staging are separate Swarm stacks on the same node, namespace-isolated by stack name. This node is non-customer-facing and tolerates instability — it exists to catch bad builds before they reach prod.

This plan assumes the node is provisioned by Pulumi, not by hand. Manual creation in the DigitalOcean console is a fallback only. The primary goal is that the node can be destroyed and recreated from IaC with no undocumented SSH-only bootstrap steps.

---

## Primary Path: Pulumi-Managed Provisioning

### P1 — Define the Droplet in `infra-shared`
Create a DigitalOcean Droplet resource for `sprocket-dev-staging`:
- region: same as prod unless latency/cost analysis says otherwise
- size: start at `s-4vcpu-8gb` and tune after the resource audit
- image: `ubuntu-24-04-x64`
- tags: `sprocket`, `dev-staging`
- SSH keys: attach the approved infrastructure/admin keys through Pulumi config

### P2 — Attach cloud-init / user-data bootstrap
The Droplet should get cloud-init or equivalent user-data that:
- installs Docker
- enables Docker on boot
- initializes single-node Swarm if `docker info` does not already report `Swarm: active`
- writes `/etc/docker/daemon.json` with log rotation settings
- prepares GHCR authentication plumbing from a secret source
- creates any required deploy user or SSH baseline for the Automation API runner

Bootstrap must be idempotent. Re-running cloud-init or the equivalent bootstrap script should not break an already initialized node.

### P3 — Create Pulumi-managed firewall rules
Create a DigitalOcean Cloud Firewall attached to the Droplet:
- SSH (22) from trusted IPs only
- Docker Swarm ports (2377, 7946, 4789) only if future multi-node expansion requires them
- HTTP/HTTPS (80/443) from the public internet for Traefik

Prefer cloud firewalls over in-node iptables rules so the network perimeter is also captured in IaC.

### P4 — Create DNS records in Pulumi
Create DNS records pointing to the new node's IP:
- `dev.sprocket.internal` (or chosen non-prod hostname)
- `staging.sprocket.internal`

Traefik routing in `infra-services` should consume these hostnames from Pulumi config.

### P5 — Expose node connection details to `infra-services`
Export the node IP, hostname, and any Docker context / SSH connection metadata needed by the service deployment layer. `infra-services` should consume these via `pulumi.StackReference` or the Automation API entrypoint.

### P6 — Add the node's SSH key / access model for the Automation API runner
The GitHub Actions runner needs to be able to invoke `pulumi up` targeting this node. Two options:
- **Option A (recommended):** The Pulumi Automation API runner connects to Pulumi Cloud for state and issues Docker API calls via an SSH tunnel or Docker context. Add the runner's SSH key to `~/.ssh/authorized_keys` on the node.
- **Option B:** Run the Automation API runner on the node itself (self-hosted GitHub Actions runner). More operational overhead but simpler networking.

Decision needed before A3 in Plan 02 (Automation API entrypoint).

### P7 — Deploy baseline dev-staging services
Once the node is reachable and bootstrap has converged:
- run `pulumi up --stack dev-staging` from `infra-services`
- deploy Traefik and the baseline dev/staging service set
- verify service discovery, routing, and GHCR image pulls

## Manual Fallback

If Pulumi-managed provisioning is blocked temporarily, the old manual path can be used to unblock progress, but the result should be treated as temporary drift to be folded back into IaC immediately after.

### F1 — Create the Droplet manually
Use the DigitalOcean console or `doctl` to create a temporary `sprocket-dev-staging` Droplet with the same size, image, region, and tags that the Pulumi program will later own.

### F2 — Bootstrap the host manually
If required, install Docker, enable the service, initialize Swarm, and configure GHCR access manually.

### F3 — Backfill IaC immediately
Import the manually created Droplet, firewall, and DNS resources into Pulumi as soon as the blocker is resolved. Do not leave the node as a permanent click-ops exception.

---

## Agent Steps

### A1 — Add Traefik routing config for dev and staging environments
In the `infra-services` Pulumi project (from Plan 02), parameterize Traefik routing labels so each service gets the correct hostname per environment:

```typescript
const hostname = config.require("hostname"); // e.g. "dev.sprocket.gg" or "staging.sprocket.gg"

labels: {
    "traefik.enable": "true",
    "traefik.http.routers.my-service.rule": `Host(\`my-service.${hostname}\`)`,
}
```

### A2 — Add a Swarm overlay network definition for dev-staging stack
In `infra-services`, ensure the dev-staging stack creates its own named overlay network, separate from prod. Services should be attached only to their environment's network. This prevents dev traffic from accidentally routing to prod containers on the same host.

### A3 — Write a node bootstrap script
Create `scripts/bootstrap-node.sh` in the Sprocket repo's infrastructure code as the canonical implementation of the same logic used by cloud-init:
- Installs Docker
- Initializes Swarm
- Configures GHCR login plumbing (reads `GHCR_TOKEN` from env or secret material at runtime)
- Sets Docker daemon log rotation options (prevents disk fill from container logs)
- Runs a smoke test (`docker pull ghcr.io/<org>/healthcheck-image` or equivalent)

This script is idempotent (safe to re-run) and serves as documentation of the node's expected state.

### A4 — Add dev-staging stack config file
In `infra-services/`, create `Pulumi.dev-staging.yaml` with baseline config values:
```yaml
config:
  infra-services:replicaCount: "1"
  infra-services:logLevel: "debug"
  infra-services:hostname: "dev.sprocket.internal"
  infra-services:imageTag: "bootstrap-placeholder"  # overridden per-deploy by Automation API; never deploy `latest`
```

### A5 — Add a cloud-init template
Create a versioned cloud-init template in the Sprocket repo's infrastructure code:
- parameterized for hostname, users, SSH keys, and bootstrap secrets
- checked into source control
- rendered by `infra-shared` into Droplet user-data

This keeps first-boot behavior reviewable and diffable.

---

## Validation Checklist

- [ ] `pulumi up --stack shared-infra` creates the Droplet, firewall, and DNS records without manual console steps
- [ ] `docker info` on the new node shows `Swarm: active`
- [ ] `docker pull ghcr.io/<org>/<any-image>` succeeds from the new node
- [ ] `pulumi up --stack dev-staging` successfully creates Swarm services on the new node
- [ ] `curl http://dev.sprocket.internal/healthz` returns 200 for each deployed service
- [ ] Traefik dashboard shows all dev services as healthy
- [ ] No cross-environment traffic routing (dev requests do not reach prod containers)
- [ ] Destroying and recreating the Droplet from Pulumi does not require manual SSH bootstrap repair

## Tags

#project #sprocket #cd #infrastructure #digitalocean #docker-swarm
