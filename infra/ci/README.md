# CI / CD notes (infra)

## Promote dev → staging (immutable image set)

Run workflow [.github/workflows/cd-promote-dev-to-staging.yml](../../.github/workflows/cd-promote-dev-to-staging.yml) from the Actions tab with the **40-character git SHA** that is green on dev.

The job checks out that commit, sets `platform:image-tag` on the **staging** stack (optional BOM path or explicit tag; else default `sha-<short>`), then `pulumi preview` + `pulumi up` via the existing composite for **layer_1**, **layer_2**, and **platform** stacks named `staging` only—not prod.

Create GitHub environment **staging** with SSH, Tailscale, Pulumi backend, and AWS secrets (same class as other pre-prod deploys).

If `up` fails partway, completed stacks may already have changed; Pulumi does not auto-roll back—re-run with a good SHA or fix forward.
# Infra CI metadata

## `stack-map.yaml`

Single machine-readable contract for **which Pulumi stacks apply to which logical environment** (`dev`, `staging`, `prod`) and in **what order** Swarm-facing layers should run (`layer_1` → `layer_2` → `platform`).

- **Prod** entries match [`.github/workflows/infra-pulumi.yml`](../../.github/workflows/infra-pulumi.yml) PR preview matrix today.
- **Dev / staging** list candidate stack names (`dev`, `staging`) with TODO comments until ops confirms they exist ([issue #667](https://github.com/SprocketBot/sprocket/issues/667)).
- **Foundation** (`infra/foundation`) is listed separately; it is not part of the Swarm `deploy_order`.

### Who updates this

Maintainers who add or rename Pulumi stacks. After `pulumi stack ls` in each project, update this file and keep CI matrices in sync (or teach workflows to read this file).

### Future consumption

GitHub Actions or `scripts/infra` can parse this YAML with `yq`, a tiny Node script, or similar—out of scope for the initial file landing; see milestone notes in issue #667.
