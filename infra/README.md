## Tool versions

| Tool | Version | Notes |
|------|---------|--------|
| **Node.js** | **20.x** | Use for all Pulumi runs (`npm run infra:install`, GitHub Actions, local preview/up). Matches `@pulumi/pulumi` expectations. The repo root [`.nvmrc`](../.nvmrc) remains **16** for legacy application builds; switch with `nvm install 20 && nvm use 20` (or `fnm use 20`) before infra work. You may see an `npm` `EBADENGINE` warning from transitive packages (for example `minio`); it is benign for our usage. |
| **Pulumi CLI** | **3.229.0** | Pin CI installs to this version; locally run `pulumi version` after [install](https://www.pulumi.com/docs/install/) and upgrade to match if needed. CI uses `curl -fsSL https://get.pulumi.com \| sh -s -- --version 3.229.0`. |

## Infrastructure Monorepo Layout

This directory contains the Pulumi infrastructure code migrated from the former `sprocket-infra` repository.

- `global/`: shared Pulumi helpers, service definitions, and cross-stack references
- `foundation/`: cloud infrastructure substrate such as DigitalOcean nodes, firewalls, reserved IPs, DNS, and bootstrap cloud-init
- `layer_1/`: core infrastructure such as Traefik and Vault
- `layer_2/`: data services, monitoring, and Vault-backed application dependencies
- `platform/`: application and platform service deployment

## Supported Off-Node Deployment Model

The supported deployment model is now:

1. run Pulumi from a trusted maintainer machine or GitHub Actions
2. authenticate to the shared Pulumi backend
3. connect to the production tailnet with Tailscale
4. target the manager node through `DOCKER_HOST=ssh://...`
5. deploy in dependency order: `layer_1`, `layer_2`, `platform`

The production node should remain the workload host, not the workstation used to run source-controlled deploy commands.

## Pulumi Backend

The committed `Pulumi.*.yaml` files in this directory are the stack configuration that used to live in `sprocket-infra`.
Pulumi state is still stored in the configured remote backend, not in git.

Before running any stack command, log in to the same backend used before the migration:

```bash
pulumi login "s3://[your bucket]/pulumi?endpoint=[your endpoint]"
```

If your backend relies on AWS-style credentials for S3-compatible storage, ensure `~/.aws/credentials` is configured first.

Before migrating deploy execution to a new machine, verify the live stack metadata and export backups:

```bash
npm run infra:install
npm run infra:backend:verify -- layer_1 layer_1
npm run infra:backend:verify -- layer_2 layer_2
npm run infra:backend:verify -- platform prod
```

These commands export state under `infra/backups/` and record:

- backend identity from `pulumi whoami -v`
- secrets provider metadata from `pulumi stack export`
- whether the local stack config still carries an `encryptionsalt`

## Deployment Order

Bootstrap and normal deployments should continue to run in dependency order:

1. `infra/foundation`
2. `infra/layer_1`
3. `infra/layer_2`
4. `infra/platform`

`infra/global` is a shared local package consumed by the stack projects above.

## Remote Docker Host

Preferred off-node Docker host target:

```bash
export DOCKER_HOST=ssh://deploy@sprocket-prod
```

If you prefer to derive it from the helper scripts instead of exporting it directly:

```bash
export PULUMI_REMOTE_DOCKER_USER=deploy
export PULUMI_REMOTE_DOCKER_HOST=sprocket-prod
```

## Canonical Command Surface

From a clean shell session:

```bash
nvm install 20
nvm use 20
npm run infra:install

export PULUMI_BACKEND_URL='s3://[your bucket]/pulumi?endpoint=[your endpoint]'
export DOCKER_HOST=ssh://deploy@sprocket-prod

npm run infra:preview -- layer_1 layer_1
npm run infra:preview -- layer_2 layer_2
npm run infra:preview -- platform prod

npm run infra:up -- platform prod --yes
```

`infra:up` runs a preview first unless `PULUMI_SKIP_PREVIEW=1` is set.

## Lane ↔ Pulumi stack map (hosted)

| Lane (harness) | Environment contract | Platform stack (typical) | Notes |
|----------------|----------------------|---------------------------|--------|
| `main-prod` | `environments/main-prod.json` | `platform` / `prod` | Production Swarm + DO managed DB. |
| `main-dev` | `environments/main-dev.json` | `platform` / `dev` | Pre-prod Swarm; **isolated** subdomain, DB target, Redis prefix, RabbitMQ vhost, and Swarm labels vs prod/staging. Template: `platform/Pulumi.dev.template.yaml`. Cross-ref: GitHub #672. |
| `v15-beta` | `environments/v15-beta.json` | `platform` / stack per operator | Template: `platform/Pulumi.v15-beta.template.yaml`. |

`layer_1` and `layer_2` stack names are usually `layer_1` and `layer_2` on the same manager unless a separate substrate is provisioned; confirm with `pulumi stack ls` per project before apply.

## GitHub Actions

### Container image tags (CI)

Autobuild (`.github/workflows/on-changes.yml`) pushes each image with a **branch-style** tag (`main`, `staging`, `dev`, or `pr-<n>`) and an **immutable** tag `sha-<full-git-sha>` (PR builds that push use the pull-request **head** SHA, not the merge ref). Prefer pinning deploys to `sha-*` or digest; moving tags are convenience aliases only. Adopting those refs in Pulumi stack config is tracked separately (e.g. issues #672 / #673).

The reusable GitHub Actions entrypoint for the same contract lives at:

- `.github/reusable_workflows/pulumi_up/action.yaml`

Use it with:

- `stack-project`: `layer_1`, `layer_2`, or `platform`
- `stack-name`: the Pulumi stack name, such as `layer_1`, `layer_2`, or `prod`
- `command`: `preview`, `up`, or `refresh`
- `manager-node-host`: the Tailscale-reachable SSH host for Docker

Production applies should be routed through a protected GitHub Environment.
