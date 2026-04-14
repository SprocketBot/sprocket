# CI / CD notes (infra)

## Promote dev → staging (immutable image set)

Run workflow [.github/workflows/cd-promote-dev-to-staging.yml](../../.github/workflows/cd-promote-dev-to-staging.yml) from the Actions tab with the **40-character git SHA** that is green on dev.

The job checks out that commit, sets `platform:image-tag` on the **staging** stack (optional BOM path or explicit tag; else default `sha-<short>`), then `pulumi preview` + `pulumi up` via the existing composite for **layer_1**, **layer_2**, and **platform** stacks named `staging` only—not prod.

Create GitHub environment **staging** with SSH, Tailscale, Pulumi backend, and AWS secrets (same class as other pre-prod deploys).

If `up` fails partway, completed stacks may already have changed; Pulumi does not auto-roll back—re-run with a good SHA or fix forward.

---

## Staging synthetic canary (#677)

**Purpose:** Data-driven gate between **dev** and **staging** (or verification **after** a staging deploy) using only synthetic HTTP checks—no Grafana auth in CI.

**Policy in `cd-promote-dev-to-staging`:** After all staging `pulumi up` steps succeed, a follow-up job runs [.github/workflows/canary-staging.yml](../../.github/workflows/canary-staging.yml) against **staging** URLs from repository **variables** `CANARY_STAGING_BASE_URL` (optional; defaults to `https://staging.app.sprocket.gg` in the caller) and **`CANARY_STAGING_API_URL` (required)** — set at least the GraphQL URL on the repo or inherit via the **staging** environment. This matches `infra/docs-output/CICD_STRATEGY.md` § Post-Deploy Verification.

**Alternative:** Run the same reusable workflow **before** `pulumi up` with **dev** URLs to prove dev is stable first; adjust variables or add a separate caller job.

If staging (or dev) is not reachable from GitHub-hosted runners, use a runner with network access (for example Tailscale or self-hosted), as with other internal deploy workflows—do not disable TLS verification to work around reachability.

### Script

- Path: `scripts/ci/canary-staging.sh`
- Behavior: Every `CANARY_INTERVAL_SEC` for `CANARY_DURATION_SEC`, `GET` the web origin (with redirects) and `POST` a minimal GraphQL query to `STAGING_API_URL`. Records latencies for successful probes and fails if failure budgets or p95 latency thresholds are exceeded.

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STAGING_BASE_URL` | yes | — | Web origin (no trailing path required; script hits `/`). |
| `STAGING_API_URL` | yes | — | Full GraphQL HTTP endpoint URL. |
| `CANARY_DURATION_SEC` | no | `600` | Total observation window (~10 minutes). |
| `CANARY_INTERVAL_SEC` | no | `60` | Sleep between probe rounds. |
| `CANARY_ONCE` | no | `false` | If `true`, run exactly one probe round (for quick validation). |
| `CANARY_REQUEST_TIMEOUT_SEC` | no | `25` | Per-request curl timeout. |
| `CANARY_WEB_ALLOWED_STATUSES` | no | `200,204,302` | Comma-separated acceptable HTTP statuses for the web probe. |
| `CANARY_WEB_MAX_FAILURES` | no | `2` | Fail when web probe failures exceed this count (cumulative). |
| `CANARY_GRAPHQL_MAX_FAILURES` | no | `2` | Fail when GraphQL probe failures exceed this count. |
| `CANARY_P95_LATENCY_MS_WEB` | no | `8000` | Fail if p95 of **successful** web latencies exceeds this (milliseconds). |
| `CANARY_P95_LATENCY_MS_API` | no | `8000` | Fail if p95 of **successful** GraphQL latencies exceeds this. |
| `CANARY_GRAPHQL_BODY` | no | minimal `__typename` query | JSON POST body; override only if your schema requires a different probe. |
| `CANARY_AUTH_HEADER` | no | unset | Optional `Authorization: ...` header; **never** print or log its value. |
| `CANARY_ARTIFACT_DIR` | no | `artifacts/canary-run` | Log and timing files for CI artifacts. |

### GitHub Actions

- Workflow: `.github/workflows/canary-staging.yml`
- **`workflow_dispatch`:** Manual “canary only” run. Optional repo variables: `CANARY_STAGING_BASE_URL`, `CANARY_STAGING_API_URL`. If the API variable is unset, provide **GraphQL URL** in the dispatch form.
- **`workflow_call`:** Reuse from a promotion pipeline; pass `staging_base_url`, `staging_api_url`, and optional duration/interval/`canary_once`.
- **Job timeout:** 45 minutes (well under the 6-hour GitHub job limit and typical free-tier usage).
- **Artifacts:** `artifacts/canary-run/` (log, per-probe timings, summary) uploaded on success or failure.

### Example: caller-only sketch (custom placement)

```yaml
jobs:
  canary-before-staging:
    uses: ./.github/workflows/canary-staging.yml
    with:
      staging_base_url: https://dev.example.com
      staging_api_url: https://api.dev.example.com/graphql
      duration_sec: '600'
      interval_sec: '60'
```

### Tuning

- Start with **10 minutes** / **60 s** interval (~10 rounds). Adjust `CANARY_*_MAX_FAILURES` for flake tolerance (e.g. allow 2 bad rounds).
- Tighten `CANARY_P95_LATENCY_MS_*` once you have measured baselines on staging.
# Infra CI metadata

## `stack-map.yaml`

Single machine-readable contract for **which Pulumi stacks apply to which logical environment** (`dev`, `staging`, `prod`) and in **what order** Swarm-facing layers should run (`layer_1` → `layer_2` → `platform`).

- **Prod** entries match [`.github/workflows/infra-pulumi.yml`](../../.github/workflows/infra-pulumi.yml) PR preview matrix today.
- **Dev** entries match [`.github/workflows/cd-deploy-dev.yml`](../../.github/workflows/cd-deploy-dev.yml) (layer stacks use project names; platform stack defaults to `dev` in the map and can be overridden by `PULUMI_DEV_PLATFORM_STACK` in CD).
- **Staging** entries match [`.github/workflows/cd-promote-dev-to-staging.yml`](../../.github/workflows/cd-promote-dev-to-staging.yml) (`staging` stack per project).
- **Foundation** (`infra/foundation`) is listed separately; it is not part of the Swarm `deploy_order`.

### Who updates this

Maintainers who add or rename Pulumi stacks. After `pulumi stack ls` in each project, update this file; CD workflows read deploy order from here via [`scripts/ci/read-stack-map.mjs`](../../scripts/ci/read-stack-map.mjs) ([issue #682](https://github.com/SprocketBot/sprocket/issues/682)).

### Parameterized deploy workflows (#682)

| Wrapper (thin caller) | Reusable core | GitHub `environment` (jobs inside reusable workflow) |
|----------------------|---------------|--------------------------------------------------------|
| [`.github/workflows/cd-deploy-dev.yml`](../../.github/workflows/cd-deploy-dev.yml) | [`.github/workflows/_reusable-pulumi-deploy.yml`](../../.github/workflows/_reusable-pulumi-deploy.yml) | `development` (`dev_prepare` + deploy steps) |
| [`.github/workflows/cd-promote-dev-to-staging.yml`](../../.github/workflows/cd-promote-dev-to-staging.yml) | same (`staging_include_promote_step: true` runs `promote-images.sh` then Pulumi ups) | `staging` |
| [`.github/workflows/cd-deploy-prod.yml`](../../.github/workflows/cd-deploy-prod.yml) | same | `production` |
| [`.github/workflows/ci-stack-map-pulumi-preview.yml`](../../.github/workflows/ci-stack-map-pulumi-preview.yml) | same | `preview` |

**Execution model:** `_reusable-pulumi-deploy.yml` now computes a scope-aware plan from `git_sha`, then runs the selected stack sequence in a **single runner**. App-only commits usually touch `platform` only; lower-layer infra changes pull in the affected layer plus `platform`; shared infra / workflow changes keep the full order. When an explicit `preview` row exists immediately before an `up` row for the same stack, the apply uses `--skip-preview` to avoid paying for the same preview twice.

For `dev_cd`, the reusable workflow also runs a **foundation prerequisite** against `infra/foundation` / `dev-staging` before the Swarm stacks. That foundation apply is gated so it only runs when the foundation stack has never been applied yet or when the target commit touches foundation-related inputs; otherwise the job records a skip and continues to the normal dev stack sequence.

**Reusable workflow inputs (for junior devs):**

| Input | Meaning |
|-------|--------|
| `lane` | Reserved for future lane routing (e.g. `main`, `v15`); defaults to `main`. |
| `target` | Which `environments.<name>` block in `stack-map.yaml` to use for **`preview_all`** only (`dev`, `staging`, or `prod`). |
| `git_sha` | Exact commit to check out for every job. |
| `deploy_profile` | `dev_cd` (BOM download + image tag + scoped dev preview/apply sequence), `staging_up` (optional image promote then scoped staging `up` sequence), `prod_cd` (scoped prod previews followed by prod applies), `preview_all` (preview every stack in `target`). |
| `bom_download_run_id` | For `dev_cd` after Autobuild: GitHub run id to download `bom-main` from; empty for manual deploys. |
| `dev_foundation_stack` | Foundation stack checked before `dev_cd` Swarm applies (typically `dev-staging`). |
| `dev_platform_stack` | Platform stack name for `dev_cd` (must not be `prod`). |
| `staging_include_promote_step` | For `staging_up` only: when `true`, the plan runs `scripts/ci/promote-images.sh` against stack `staging` before the scoped Pulumi applies. |
| `promote_bom_file` / `promote_image_tag` | Optional inputs for that promote step (same semantics as the workflow dispatch form on promote). |
| `prod_confirm` | For `prod_cd` only: same typo guard as the old `confirm` workflow input (empty, or repo full name, or `DEPLOY_PROD`). |

**Secrets:** Callers use `secrets: inherit`. The reusable workflow uses **pre-prod** secret names (`PULUMI_*`, `AWS_*`, …) for `dev_cd`, `staging_up`, and `preview_all`, and **prod** names (`PROD_*`, `PROD_PULUMI_ACCESS_TOKEN`) for `prod_cd`. A new lane needs its own wrapper workflow (or duplicate job) that runs under the right GitHub Environment and maps lane-specific secret names explicitly—Actions cannot build `secrets` keys from variables.

**Caller `environment`:** Wrapper jobs do **not** set `environment` (avoids duplicate approval gates). Jobs inside `_reusable-pulumi-deploy.yml` set `environment` per profile (`development`, `staging`, `production`, `preview`) so scoped secrets apply to Pulumi and promote steps only.

**Local check:** `node scripts/ci/read-stack-map.mjs emit --plan prod_cd` prints `plan_json` / `projects_json` (also written to `GITHUB_OUTPUT` when that variable is set in Actions). Add `--git-sha <sha>` to see the scoped sequence for a real commit.

### Future consumption

Older note: parsing was optional at file landing (#667). CD now consumes this file via `read-stack-map.mjs`; PR checks that touch `infra/ci/**` run [`.github/workflows/ci-stack-map-pulumi-preview.yml`](../../.github/workflows/ci-stack-map-pulumi-preview.yml) to exercise the same path with `preview_all` / `target: dev`.
