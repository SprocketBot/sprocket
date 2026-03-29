# IaC for Sprocket Node Provisioning

**Created**: 2026-03-17
**Status**: Working note
**Project**: Sprocket

## Question

Can Sprocket use infrastructure-as-code to generate the deployment nodes themselves, rather than creating Droplets manually and then configuring them over SSH?

## Short answer

Yes. In fact, that is the right next step.

The current CD design automates application deployment, but `projects/sprocket/cd-system/plan-03-provision-dev-staging-node.md` still treats node creation as a manual operation. That leaves a gap: the most failure-prone part of the platform base layer is still outside version control and still vulnerable to drift.

The better target state is:

1. Use Pulumi to create the Droplets, firewalls, DNS records, and tags.
2. Use cloud-init or user-data to bootstrap Docker, Swarm, GHCR auth plumbing, log rotation, and baseline OS settings.
3. Use the existing `infra-services` Pulumi project only after the node is alive and reachable.

That gives Sprocket IaC for both:

- **infrastructure substrate**: nodes, networking, firewalling, DNS
- **service deployment**: Swarm services, routing, secrets, image tags

## Recommended boundary

Do **not** mix "create the VM" and "deploy the app stack" into one undifferentiated Pulumi program.

Use a three-layer model instead:

| Layer | Pulumi project | Responsibility |
|---|---|---|
| Foundation | `infra-foundation` or extend `infra-shared` | Droplets, reserved IPs, firewalls, DNS, SSH key registration |
| Bootstrap | same foundation layer via cloud-init | Install Docker, enable service, init Swarm, prepare host state |
| Services | `infra-services` | Deploy Traefik, Loki, Grafana, and app services onto the ready node |

This preserves a clean separation:

- Node lifecycle can change without forcing service redeploy logic to change
- Replacing a node becomes a standard `pulumi up`, not an ad hoc recovery exercise
- The GitHub Actions CD pipeline stays focused on image promotion, not VM provisioning

## What should be declarative

These belong in IaC:

- DigitalOcean Droplets for `dev-staging` and `prod`
- Cloud firewalls and allowed ports
- DNS records for `dev`, `staging`, and `prod`
- Droplet tags
- Attached volumes, if any are needed later
- Cloud-init payload used to bootstrap the node

These should **not** be left as one-off manual steps:

- Docker installation
- `docker swarm init`
- daemon log rotation config
- creating the deploy user / SSH access model
- baseline GHCR credential wiring

## What should stay out of bootstrap

Bootstrap should stop after the host is ready to accept managed service deployment.

Do not bake these into first-boot scripts:

- per-release image tags
- app rollout decisions
- promotion gates
- service-level scaling changes

Those still belong in the Automation API + `infra-services` deployment layer.

## Practical design for Sprocket

### Option A — Strong recommendation

Use Pulumi's DigitalOcean provider to create:

- `sprocket-dev-staging` Droplet
- `sprocket-prod` Droplet
- one firewall per node role
- DNS records for environment hostnames

Each Droplet gets cloud-init that:

- installs Docker
- enables Docker on boot
- initializes single-node Swarm if not already active
- configures `/etc/docker/daemon.json` with log rotation
- installs or prepares GHCR credentials from a secret source

Then `infra-services` targets the node over the Docker API / Docker context exactly as planned today.

### Option B — Transitional

If the in-repo infrastructure code is not ready for full node creation yet, start by adding:

- firewall + DNS + cloud-init templates to Pulumi
- a Pulumi-managed Droplet only for `dev-staging`

Keep prod manual until the replacement path is proven in non-prod.

This reduces risk while still moving the most important part of the system under IaC.

## Important caveat

`docker swarm init` on a single node is easy to automate, but long-term cluster growth changes the model.

If Sprocket later moves from single-node Swarm to a real multi-node manager/worker topology, bootstrap will need to handle:

- join tokens
- manager quorum
- private overlay traffic between nodes
- more careful certificate and secret distribution

That is not a reason to avoid IaC now. It just means the current bootstrap should be written around today's actual topology: two separate single-node environments.

## Changes implied for the existing CD notes

### `cd-environment-topology`

Add a new statement that environment topology is four things, not just stack layout:

- node creation
- host bootstrap
- service deployment
- promotion flow

### `plan-02-pulumi-stack-refactor`

Either:

- expand `infra-shared` to own foundation resources, or
- rename it to something like `infra-foundation` if shared networking is no longer the whole story

### `plan-03-provision-dev-staging-node`

This plan should be rewritten from "manual provisioning checklist" to "Pulumi-managed node provisioning + bootstrap validation".

The manual fallback can remain, but it should not be the primary path.

## Suggested implementation sequence

1. Extend the Pulumi refactor so one project owns DigitalOcean resources.
2. Add a cloud-init template for node bootstrap.
3. Provision only `dev-staging` through IaC first.
4. Validate that a destroyed non-prod node can be recreated end-to-end from Pulumi alone.
5. After that works, move `prod` node creation under the same pattern.

## Recommendation

Sprocket should absolutely use IaC to generate the nodes themselves.

The cleanest path is:

- Pulumi creates the Droplet
- cloud-init makes the Droplet Swarm-ready
- the Automation API deploys services onto it

That closes the current automation gap without collapsing provisioning and deployment into one brittle workflow.

## Related notes

- `projects/sprocket/cd-system/cd-environment-topology.md`
- `projects/sprocket/cd-system/plan-02-pulumi-stack-refactor.md`
- `projects/sprocket/cd-system/plan-03-provision-dev-staging-node.md`
- `projects/sprocket/Reaching CI CD Nirvana.md`
