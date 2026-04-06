# Sprocket CI/CD Strategy

**Status**: Proposed
**Last Updated**: March 13, 2026
**Audience**: Maintainers of the Sprocket application and infrastructure

---

## Why This Document Exists

Today, infrastructure changes are deployed by cloning the infra repository onto the production node and running Pulumi there by hand.

That works, but it creates a few persistent problems:

- The production node is both the deploy target and the deploy workstation
- Deployments depend on whoever last configured that machine correctly
- There is no consistent approval trail for `pulumi up`
- Application and infrastructure changes are hard to coordinate
- Rollback discipline depends on operator memory, not on process

Now that the infrastructure code lives in this monorepo, we can replace that manual model with a CI/CD workflow that still fits the current Docker Swarm + Pulumi architecture.

---

## Current State

Current deployment flow:

1. Push code somewhere
2. SSH to the production node
3. `git pull` or re-clone infra code
4. Log into Pulumi on the node
5. Run `pulumi up` in `infra/layer_1`, `infra/layer_2`, or `infra/platform`

This has three major drawbacks:

- **State of the deploy environment is implicit**
  The node needs the right Pulumi CLI, Node.js version, npm dependencies, Docker access, and cloud credentials.

- **Production access is broader than necessary**
  Anyone who can deploy typically needs shell access to the node.

- **Build and deploy are coupled**
  If app images are also built manually or outside a controlled pipeline, it is harder to know exactly what code is running.

---

## Goals

The target CI/CD system should:

- Build application artifacts in CI, not on the production node
- Run Pulumi from a controlled automation environment
- Keep manual approval for production applies
- Preserve the current stack structure: `layer_1`, `layer_2`, `platform`
- Avoid storing Pulumi state in git
- Minimize long-lived credentials on the production node
- Be adoptable in phases without a full platform rewrite

Non-goals:

- Replacing Docker Swarm immediately
- Rewriting the Pulumi programs
- Introducing full GitOps tooling on day one

---

## Recommended End State

The most practical target is:

1. **GitHub Actions builds and pushes application images**
2. **GitHub Actions runs `pulumi preview` on pull requests**
3. **GitHub Actions runs `pulumi up` after approval on merges to `main`**
4. **Production deploys use a protected GitHub Environment**
5. **The production node only runs workloads, not source-controlled deploy commands**

In other words:

- CI builds artifacts
- CI performs previews
- CD performs applies
- Humans approve production
- The server stops being your deployment workstation

---

## Deployment Model Options

There are three realistic ways to implement this.

### Option A: GitHub Actions Runner Deploys Directly to Docker on the Production Node

How it works:

- GitHub Actions runs in GitHub-hosted runners
- The workflow opens a secure connection to the production Docker API, usually through SSH tunneling
- Pulumi runs in CI and talks to the remote Docker engine on the production node

Pros:

- Minimal change to your current Pulumi programs
- No persistent repo checkout on the server
- Easy to keep previews and applies in one system

Cons:

- CI needs network path to the production node
- You must manage secure remote Docker access carefully
- GitHub-hosted runners can make networking awkward if the node is not publicly reachable

Best when:

- The production node is reachable over SSH from CI
- You want the smallest migration from the current model

### Option B: Self-Hosted GitHub Runner on the Production Node

How it works:

- A GitHub Actions self-hosted runner is installed on the production node
- Workflows execute there
- The repo is checked out ephemerally for each job
- Pulumi runs locally on the node under GitHub Actions control

Pros:

- Easy Docker access
- Simplest networking
- Easy first step away from fully manual deployments

Cons:

- The production node is still the execution environment for deploy logic
- A compromised workflow has local access to the production node
- Runner hygiene and isolation matter a lot

Best when:

- You need a low-friction intermediate step
- You cannot easily expose or tunnel Docker access safely from hosted runners

### Option C: Dedicated Deployment Runner Outside the Production Node

How it works:

- A hardened CI runner exists outside the production node
- It has Pulumi access, cloud credentials, and secure network path to Docker/SSH endpoints
- All deploys run there

Pros:

- Cleanest separation of duties
- Better security posture than running deploy logic on prod
- Easier to audit and harden

Cons:

- More setup work
- Requires another managed machine or runner platform

Best when:

- You want the best long-term operational model without changing away from Pulumi + Swarm yet

### Recommendation

For Sprocket, use **Option A** if secure remote Docker connectivity from GitHub Actions is straightforward.
If that is operationally awkward, use **Option B as a temporary step**, then move to **Option C** later.

Option B is acceptable as a transition. It should not be the final design if you want the production node to stop being the deployment workstation.

---

## Proposed Pipeline

### 1. Pull Request Validation

On every PR that touches app or infra code:

- Detect changed paths
- Install dependencies needed for affected workspaces
- Build changed application packages
- Build and lint infra TypeScript if needed
- Run `pulumi preview` for affected stacks
- Post preview output to the PR

Expected behavior:

- App-only PR: build/test app, maybe skip infra preview
- Infra-only PR: run Pulumi preview for changed stack(s)
- App + infra PR: build images first, then preview against the new image tags or intended release identifiers

### 2. Image Build Pipeline

On merge to `main`:

- Build deployable service images
- Tag images with immutable identifiers, usually git SHA
- Push them to your container registry

Recommended tagging:

- `:git-<sha>`
- optional environment aliases like `:main`

Do not rely on mutable tags alone for Pulumi deploys.
Pulumi should ideally point at an immutable image tag or digest.

### 3. Production Deploy Workflow

On merge to `main`, or via manual dispatch:

1. Build or resolve the image set to deploy
2. Select target stack(s)
3. Run `pulumi preview`
4. Require human approval through GitHub Environments
5. Run `pulumi up --yes`
6. Publish deployment summary and links to logs

### 4. Post-Deploy Verification

After `pulumi up`:

- Run smoke checks against public endpoints
- Optionally run your existing harness checks where practical
- Fail the workflow if critical health checks fail

This does not automatically roll back, but it gives immediate signal and a permanent audit trail.

---

## Secrets and Access Model

This is the most important part of making CI/CD safe.

### What CI Needs

CI will need:

- Pulumi backend access
- Pulumi secrets provider access, if applicable
- Cloud provider credentials used by the Pulumi programs
- Docker registry credentials
- A way to reach the production Docker engine or the production runner

### What the Production Node Should Need

Preferably:

- Runtime secrets needed by deployed services
- Docker runtime access
- Little or no long-lived source-control/deployment credentials

The production node should not need:

- A persistent git checkout of this repository
- Personal maintainer SSH keys for deployment
- Ad hoc Pulumi credentials used interactively

### GitHub Environments

Use at least these environments:

- `preview`
- `production`

Protect `production` with:

- Required reviewers
- Restricted branches
- Environment-scoped secrets

This gives you an approval gate without inventing custom tooling.

---

## Recommended Credential Layout

### In GitHub Secrets / Environments

Repository or environment secrets:

- `PULUMI_ACCESS_TOKEN` or backend credentials
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` if using S3-compatible backend auth
- Registry credentials
- SSH private key or tunnel credentials if using remote Docker over SSH
- Any cloud credentials needed for managed services

Environment-specific variables:

- target stack names
- deployment hostnames
- image tags or release channel values

### On the Production Node

Keep only what the running services need.
Avoid storing deploy-only credentials there unless you are using a self-hosted runner as a transitional step.

---

## How Pulumi Fits Into This

Pulumi remains the source of truth for infrastructure state.

The important change is **where** Pulumi runs:

- Current model: Pulumi runs manually on prod
- Proposed model: Pulumi runs in CI/CD, with approval gates

To make this stable:

- Keep stack names unchanged
- Keep backend configuration unchanged unless intentionally migrating it
- Make image references explicit and reproducible
- Prefer `pulumi preview` in PRs and `pulumi up` only after approval

You should also standardize per-stack commands so CI does not guess.

Stack names and order are defined in `infra/ci/stack-map.yaml`.

For example:

- `infra/layer_1`
- `infra/layer_2`
- `infra/platform`

Each stack job should:

1. install dependencies
2. authenticate to Pulumi backend
3. select the stack
4. run preview or apply

---

## Recommended Rollout Plan

Do this in phases instead of trying to automate everything at once.

### Phase 1: Standardize Manual Deploys

Before introducing CI/CD:

- Document the exact deploy commands per stack
- Pin supported Node.js and Pulumi CLI versions
- Ensure all deploy dependencies can be installed from the repo alone
- Stop relying on undocumented machine-local setup

Success criteria:

- A maintainer can follow the docs from a clean shell session

### Phase 2: CI for Preview Only

Add GitHub Actions that:

- build affected code
- run `pulumi preview` for affected stacks
- post results to PRs

No production applies yet.

Success criteria:

- Every infra PR gets a preview
- Preview failures are visible before merge

### Phase 3: CI Builds Images

Move image building and pushing into Actions.

Success criteria:

- Production deploys reference CI-built images, not manually built ones

### Phase 4: Manual Approval + Automated Apply

Enable `pulumi up` from Actions behind production approvals.

Success criteria:

- No SSH-to-prod deploy step
- Every deploy has workflow logs and approver history

### Phase 5: Hardening

- add smoke tests after deploy
- add rollback runbooks
- reduce production-node credentials further
- consider a dedicated deployment runner if still using prod-hosted runner execution

---

## What to Build First

If you only do three things, do these:

1. **Build and push images from GitHub Actions**
2. **Run `pulumi preview` on every infra PR**
3. **Run production `pulumi up` from an approved workflow, not from an SSH shell**

That gets most of the value without changing the entire platform.

---

## Risks and Mitigations

### Risk: CI can reach production too broadly

Mitigation:

- use GitHub Environment approvals
- scope secrets narrowly
- use a dedicated deploy identity
- prefer a dedicated deploy runner over long-term self-hosted-on-prod

### Risk: Pulumi apply becomes harder to debug than SSHing into the box

Mitigation:

- keep deploy scripts explicit
- log stack selection, image versions, and target host
- retain a break-glass manual runbook for emergencies

### Risk: App and infra changes drift apart

Mitigation:

- deploy immutable image tags built in the same pipeline
- allow monorepo PRs to preview both app and infra changes together

### Risk: Rollback remains manual

Mitigation:

- document image rollback and stack rollback procedures
- store previous deployed image identifiers in workflow history

---

## Suggested Repository Additions

To support this model cleanly, the repo should eventually grow:

- `.github/workflows/infra-preview.yml`
- `.github/workflows/build-images.yml`
- `.github/workflows/deploy-production.yml`
- `infra/scripts/` helpers for stack select / preview / apply
- a small configuration file describing which services map to which image names and stacks

You do not need to implement all of this at once.

---

## Concrete First Milestone

The first meaningful milestone is:

**A PR that changes `infra/platform/**` automatically runs `pulumi preview` in CI and posts the result to GitHub.**

That proves:

- CI can authenticate to Pulumi
- CI can install the infra packages
- CI can select the stack reliably
- CI has enough environment configuration to act as the deploy control plane

Once that works, production apply automation is mostly a policy and credentialing exercise.

---

## Recommended Decision

Adopt this plan:

1. Keep Pulumi and the current stack layout
2. Move image builds into GitHub Actions
3. Add PR previews for infra changes
4. Add approved production applies from Actions
5. Use a self-hosted runner on the production node only if needed as a temporary bridge

This gives you a path from today's manual process to a real CI/CD system without forcing a platform migration at the same time.
