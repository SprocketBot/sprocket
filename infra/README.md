## Infrastructure Monorepo Layout

This directory contains the Pulumi infrastructure code migrated from the former `sprocket-infra` repository.

- `global/`: shared Pulumi helpers, service definitions, and cross-stack references
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

1. `infra/layer_1`
2. `infra/layer_2`
3. `infra/platform`

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
nvm use
npm run infra:install

export PULUMI_BACKEND_URL='s3://[your bucket]/pulumi?endpoint=[your endpoint]'
export DOCKER_HOST=ssh://deploy@sprocket-prod

npm run infra:preview -- layer_1 layer_1
npm run infra:preview -- layer_2 layer_2
npm run infra:preview -- platform prod

npm run infra:up -- platform prod --yes
```

`infra:up` runs a preview first unless `PULUMI_SKIP_PREVIEW=1` is set.

## GitHub Actions

The reusable GitHub Actions entrypoint for the same contract lives at:

- `.github/reusable_workflows/pulumi_up/action.yaml`

Use it with:

- `stack-project`: `layer_1`, `layer_2`, or `platform`
- `stack-name`: the Pulumi stack name, such as `layer_1`, `layer_2`, or `prod`
- `command`: `preview`, `up`, or `refresh`
- `manager-node-host`: the Tailscale-reachable SSH host for Docker

Production applies should be routed through a protected GitHub Environment.
