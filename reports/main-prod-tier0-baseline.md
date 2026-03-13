# `main` Production Tier 0 Baseline

Updated: March 12, 2026

## Purpose

Pin down the real hosted Tier 0 verification target for the current production lane and make it runnable via the harness scripts.

## Active Hosted Endpoints

Derived from `sprocket-infra` production stack config and verified live on March 12, 2026:

- Web: `https://sprocket.mlesports.gg`
- API: `https://api.sprocket.mlesports.gg/graphql`

Relevant infra references:

- `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/platform/Pulumi.prod.yaml`
- `/Users/jacbaile/Workspace/MLE/Infrastructure/sprocket-infra/global/helpers/buildHost.ts`

## Observed Live Behavior

Observed on March 12, 2026:

1. `https://sprocket.mlesports.gg` returns `302` and redirects to `/auth/login`.
2. following that redirect returns `200` with the login page shell.
3. `https://api.sprocket.mlesports.gg/graphql` returns `405` to a `HEAD` request, which is acceptable for Tier 0 API reachability because it proves the endpoint is present and method-gated.

Observed via the committed harness runner on March 12, 2026:

1. web check passed with `302 -> 200`,
2. API check passed with `GET /graphql -> 400`,
3. dependency check passed against the public web/API endpoints.

Latest recorded run artifact from this workspace:

- `artifacts/release-validation/main-prod/20260312T222755Z/`

## Harness Profile

The committed production profile is:

- `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket/scripts/harness/env/main-prod.env`

## One-Command Execution

Run Tier 0 against hosted production with:

```bash
npm run harness:tier0:main-prod
```

Or directly:

```bash
bash ./scripts/harness/run-tier0.sh env/main-prod.env
```

Artifacts are written under:

- `artifacts/release-validation/main-prod/<run-id>/`

## Current Tier 0 Contract

The current hosted production Tier 0 pass means:

1. web ingress is reachable,
2. login shell can be reached,
3. GraphQL ingress is reachable,
4. basic dependency reachability checks can reuse the public web/API endpoints until deeper dependency probes are added.

## Next Step

After this baseline, the next hosted verification work should be:

1. add a lightweight GraphQL POST check for production,
2. add authenticated Tier 1 League Play read automation,
3. carry the same Tier 0 runner shape into the future `v1.5` beta profile.
