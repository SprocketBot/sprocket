# CI / CD notes (infra)

## Promote dev → staging (immutable image set)

Run workflow [.github/workflows/cd-promote-dev-to-staging.yml](../../.github/workflows/cd-promote-dev-to-staging.yml) from the Actions tab with the **40-character git SHA** that is green on dev.

The job checks out that commit, sets `platform:image-tag` on the **staging** stack (optional BOM path or explicit tag; else default `sha-<short>`), then `pulumi preview` + `pulumi up` via the existing composite for **layer_1**, **layer_2**, and **platform** stacks named `staging` only—not prod.

Create GitHub environment **staging** with SSH, Tailscale, Pulumi backend, and AWS secrets (same class as other pre-prod deploys).

If `up` fails partway, completed stacks may already have changed; Pulumi does not auto-roll back—re-run with a good SHA or fix forward.
