# Foundation (DigitalOcean)

Pulumi project for the **foundation** stack: DigitalOcean droplet, firewall rules, DNS, and cloud-init bootstrap (Docker and Swarm init). This code talks to the **DigitalOcean API only**; it does not deploy application containers.

## CI

Pull requests that change files under `infra/foundation/` run **GitHub Actions** `pulumi preview` against the configured dev foundation stack (see `.github/workflows/infra-foundation-preview.yml` for required secrets and the stack name variable). That validates TypeScript and provider configuration before merge without applying changes.

## Dev SSH access

The committed `dev-staging` stack currently allows SSH from `0.0.0.0/0` and `::/0` so GitHub-hosted runners can reach the dedicated dev manager over public port `22` without Tailscale. Tighten `foundation:admin-cidrs` again once a private access path is in place.
