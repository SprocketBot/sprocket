# Infra Deployment Scripts

These scripts standardize the off-node Pulumi workflow so the same deploy
contract works from a maintainer laptop and from GitHub Actions.

## Supported Stack Projects

- `layer_1`
- `layer_2`
- `platform`

## Prerequisites

- Node.js `16` (`nvm use` at repo root)
- Pulumi CLI installed
- `jq` installed for backend verification
- Tailscale connected to the production tailnet
- SSH access to the Docker manager node
- Pulumi backend credentials in the shell

## Required Environment

- `PULUMI_BACKEND_URL`
  Optional but recommended. If set, scripts run `pulumi login` explicitly.
- `DOCKER_HOST`
  Preferred. Example: `ssh://deploy@sprocket-prod`.
- `PULUMI_REMOTE_DOCKER_USER` and `PULUMI_REMOTE_DOCKER_HOST`
  Fallback if you want the runner to derive `DOCKER_HOST`.
- `PULUMI_CONFIG_PASSPHRASE`
  Only required if the selected stack still uses passphrase-based secrets.
- Provider credentials used by the stack
  Example: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for the current S3-compatible backend.

## Install Infra Dependencies

```bash
npm run infra:install
```

## Verify Backend and Export a Backup

```bash
npm run infra:backend:verify -- platform prod
```

This exports state to `infra/backups/` and writes a short report showing:

- selected project and stack
- current backend identity from `pulumi whoami -v`
- secrets provider metadata from `pulumi stack export`
- whether the local stack file still contains an `encryptionsalt`

## Preview a Stack

```bash
export DOCKER_HOST=ssh://deploy@sprocket-prod
export PULUMI_BACKEND_URL='s3://bucket/pulumi?endpoint=https://example.com'

npm run infra:preview -- platform prod
```

## Apply a Stack

```bash
npm run infra:up -- platform prod --yes
```

`infra:up` runs a preview first by default. To bypass that behavior for an
explicitly non-production scenario:

```bash
PULUMI_SKIP_PREVIEW=1 npm run infra:up -- platform prod --yes
```
