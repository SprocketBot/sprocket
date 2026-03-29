## Infrastructure Monorepo Layout

This directory contains the Pulumi infrastructure code migrated from the former `sprocket-infra` repository.

- `global/`: shared Pulumi helpers, service definitions, and cross-stack references
- `foundation/`: cloud infrastructure substrate such as DigitalOcean nodes, firewalls, reserved IPs, DNS, and bootstrap cloud-init
- `layer_1/`: core infrastructure such as Traefik and Vault
- `layer_2/`: data services, monitoring, and Vault-backed application dependencies
- `platform/`: application and platform service deployment

## Pulumi Backend

The committed `Pulumi.*.yaml` files in this directory are the stack configuration that used to live in `sprocket-infra`.
Pulumi state is still stored in the configured remote backend, not in git.

Before running any stack command, log in to the same backend used before the migration:

```bash
pulumi login "s3://[your bucket]/pulumi?endpoint=[your endpoint]"
```

If your backend relies on AWS-style credentials for S3-compatible storage, ensure `~/.aws/credentials` is configured first.

## Deployment Order

Bootstrap and normal deployments should continue to run in dependency order:

1. `infra/foundation`
2. `infra/layer_1`
3. `infra/layer_2`
4. `infra/platform`

`infra/global` is a shared local package consumed by the stack projects above.

## Remote Docker Host

Useful snippet for pointing Pulumi at a remote Docker host:

```bash
ssh -L localhost:2377:/var/run/docker.sock user@remotehost
export DOCKER_HOST=tcp://localhost:2377
```
