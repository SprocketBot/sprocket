# Harness Scripts

These scripts are the first hosted-verification entrypoints for release validation.

They are intended to work against:

- hosted `main`,
- hosted `v1.5`,
- and later any additional candidate environment.

All scripts are environment-variable driven so they can run against real hosted lanes without baking in local-only assumptions.

Committed profiles currently live under:

- `scripts/harness/env/`

Machine-readable lane contracts now live under:

- `environments/local-dev.json`
- `environments/main-dev.json`
- `environments/main-prod.json`
- `environments/main-staging.json`
- `environments/main-dev.json`
- `environments/v15-beta.json`

**CI (GitHub Actions) for `main-dev`:** create a multiline repository or environment secret named `HARNESS_MAIN_DEV_ENV` on the GitHub **development** environment. Use the same `KEY=value` lines as `scripts/harness/env/main-dev.env` (URLs, markers, status allowlists). The post-deploy workflow writes that secret to a temp file and runs `npm run verify:tier0 -- main-dev <path>` so values are never committed and are not echoed in logs (avoid `set -x` around the write). See `.github/workflows/verify-main-dev-tier0.yml`.

The machine-readable service and environment catalog lives at:

- `scripts/harness/service-manifest.json`

For repo-level agent guidance and current operational priorities, see:

- `AGENTS.md`
- `reports/agent-ops-index.md`

## Artifact Convention

By default, each run writes artifacts under:

- `artifacts/release-validation/<environment>/<run-id>/`

Common environment variables:

- `HARNESS_ENV_NAME`
- `HARNESS_RUN_ID`
- `HARNESS_ARTIFACT_ROOT`
- `HARNESS_TIMEOUT_SECONDS`

If `HARNESS_RUN_ID` is reused across multiple steps, all outputs land in the same run directory.

## Tier 0 Scripts

### `check-web.sh`

Required:

- `HARNESS_WEB_URL`

Optional:

- `HARNESS_EXPECTED_WEB_STATUSES` default `200,302`
- `HARNESS_EXPECTED_WEB_MARKER`
- `HARNESS_FOLLOW_REDIRECTS` default `true`

Example:

```bash
HARNESS_ENV_NAME=main-prod \
HARNESS_WEB_URL=https://sprocket.example.com \
HARNESS_EXPECTED_WEB_STATUSES=200,302 \
bash ./scripts/harness/check-web.sh
```

### `check-api.sh`

Required:

- `HARNESS_API_URL`

Optional:

- `HARNESS_API_METHOD` default `GET`
- `HARNESS_API_BODY`
- `HARNESS_API_BODY_FILE`
- `HARNESS_CONTENT_TYPE` default `application/json`
- `HARNESS_AUTH_HEADER`
- `HARNESS_EXPECTED_API_STATUSES` default `200,400,401,403,405`
- `HARNESS_EXPECTED_API_MARKER`

Example:

```bash
HARNESS_ENV_NAME=main-prod \
HARNESS_API_URL=https://api.sprocket.example.com/graphql \
HARNESS_EXPECTED_API_STATUSES=200,400,401,403,405 \
bash ./scripts/harness/check-api.sh
```

### `check-dependencies.sh`

This script supports two input shapes:

1. URL checks via `HARNESS_DEPENDENCY_URLS`
2. log-marker checks via `HARNESS_DEPENDENCY_MARKERS_FILE`

`HARNESS_DEPENDENCY_URLS` format:

```text
web=https://sprocket.example.com,api=https://api.sprocket.example.com/graphql
```

`HARNESS_DEPENDENCY_MARKERS_FILE` format:

```text
# name|file|pattern
postgres|/tmp/core.log|Database connected
redis|/tmp/core.log|Redis connected
```

Example:

```bash
HARNESS_ENV_NAME=main-prod \
HARNESS_DEPENDENCY_URLS='web=https://sprocket.example.com,api=https://api.sprocket.example.com/graphql' \
bash ./scripts/harness/check-dependencies.sh
```

### `collect-artifacts.sh`

Copies operator-selected files or directories into the current run artifact folder.

Arguments and `HARNESS_COLLECT_PATHS` are both supported.

Example:

```bash
HARNESS_ENV_NAME=main-prod \
HARNESS_RUN_ID=20260312T120000Z \
bash ./scripts/harness/collect-artifacts.sh ./tmp/web.log ./tmp/api.log
```

### `run-tier0.sh`

Runs the three Tier 0 checks with a shared `HARNESS_RUN_ID`.

This is exposed through lane-aware wrappers such as:

- `npm run verify:tier0 -- local-dev`
- `npm run verify:tier0 -- main-dev`
- `npm run verify:tier0 -- main-prod`

Example:

```bash
bash ./scripts/harness/run-tier0.sh env/main-prod.env
```

### Local runtime wrappers

These wrappers are the preferred root entrypoints for agent-friendly local operations:

- `dev-up.sh`
- `dev-down.sh`
- `dev-reset.sh`
- `dev-status.sh`
- `dev-logs.sh`
- `dev-smoke.sh`

They are exposed at the repo root via:

- `npm run dev:up`
- `npm run dev:down`
- `npm run dev:reset`
- `npm run dev:status`
- `npm run dev:logs -- <service>`
- `npm run dev:smoke`

## Tier 1 Scripts

These scripts are Node-based because Tier 1 needs authenticated GraphQL and multipart upload handling.

### `run-league-read-smoke.js`

Read-only League verification.

Requirements:

- `HARNESS_API_URL`
- one of:
  - `HARNESS_BEARER_TOKEN`
  - `HARNESS_REFRESH_TOKEN`
  - `HARNESS_ADMIN_BEARER_TOKEN` plus `HARNESS_LOGIN_AS_USER_ID`
  - `HARNESS_ADMIN_REFRESH_TOKEN` plus `HARNESS_LOGIN_AS_USER_ID`

Optional:

- `HARNESS_REFRESH_URL`

Example:

```bash
node ./scripts/harness/run-league-read-smoke.js
```

### `run-scrim-lifecycle-smoke.js`

Mutating scrim verification using an ordered actor set.

Requirements:

- `HARNESS_API_URL`
- `HARNESS_MUTATION_CONFIRM=YES`
- `HARNESS_GAME_MODE_ID`
- either:
  - `HARNESS_SCRIM_ACTOR_USER_IDS` plus admin auth for impersonation
  - `HARNESS_SCRIM_ACTOR_BEARER_TOKENS`
  - or the legacy primary/secondary auth env vars

Optional:

- `HARNESS_REFRESH_URL`
- `HARNESS_SCRIM_GROUP_ASSIGNMENTS`
- `HARNESS_SCRIM_EXPECTED_MAX_PLAYERS`

Notes:

- Rocket League Doubles on hosted `main` currently requires `4` actors.
- The legacy two-actor primary/secondary env shape is still supported as a fallback.

### `run-replay-submission-smoke.js`

Mutating replay upload verification.

Requirements:

- `HARNESS_API_URL`
- `HARNESS_MUTATION_CONFIRM=YES`
- `HARNESS_REPLAY_FILE_PATHS`
- primary auth via bearer token or admin minting
- submission via `HARNESS_SUBMISSION_ID` or the current scrim's `submissionId`

Optional:

- `HARNESS_REFRESH_URL`
- `HARNESS_USE_MOCK_COMPLETION=true` with `HARNESS_ADMIN_BEARER_TOKEN` or `HARNESS_ADMIN_REFRESH_TOKEN`

### `run-tier1.sh`

Profile-driven Tier 1 wrapper for one or all hosted scenarios.

This is exposed at the repo root as:

- `npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env league`
- `npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env all`
- `npm run verify:all -- main-prod /absolute/path/to/tier1.env`

Example:

```bash
bash ./scripts/harness/run-tier1.sh /absolute/path/to/tier1.env league
bash ./scripts/harness/run-tier1.sh /absolute/path/to/tier1.env all
```

## CI gate: production Pulumi `up` (staging Tier 1)

The workflow `.github/workflows/infra-pulumi.yml` runs **Tier 1 against hosted staging** before `pulumi up` is allowed on stack **`platform` / `prod`**.

- **Blocking:** `league`, `scrim`, and `submission` scenarios run sequentially via `verify-lane.sh tier1 … all` (same as `run-tier1.sh` with scenario `all`). Any failure fails the workflow; the deploy job does not run.
- **Manual / advisory:** Tier 1 against **production** (`main-prod`), Tier 0/2 checks, load tests, and any extra scenarios you add locally remain outside this gate unless wired separately.
- **Secret:** Create a GitHub Actions **environment** secret on environment **`staging`**: `HARNESS_MAIN_STAGING_TIER1_ENV` — paste the full multiline `.env` (same shape as `scripts/harness/env/main-staging-tier1.template.env`). Use **staging-only** credentials; do not reuse a prod profile if it could mutate prod.
- **Artifacts:** On failure, the job uploads `artifacts/release-validation/` (harness outputs) as a workflow artifact.

If the combined `all` run exceeds ~45 minutes, split into separate workflow jobs per scenario (`league`, `scrim`, `submission`) only after confirming parallel runs do not conflict on shared staging test data (mutating flows may need to stay sequential).
