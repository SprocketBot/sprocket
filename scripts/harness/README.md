# Harness Scripts

These scripts are the first hosted-verification entrypoints for release validation.

They are intended to work against:

- hosted `main`,
- hosted `v1.5`,
- and later any additional candidate environment.

All scripts are environment-variable driven so they can run against real hosted lanes without baking in local-only assumptions.

Committed profiles currently live under:

- `scripts/harness/env/`

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

Example:

```bash
bash ./scripts/harness/run-tier0.sh env/main-prod.env
```

## Tier 1 Scripts

These scripts are Node-based because Tier 1 needs authenticated GraphQL and multipart upload handling.

### `run-league-read-smoke.js`

Read-only League verification.

Requirements:

- `HARNESS_API_URL`
- one of:
  - `HARNESS_BEARER_TOKEN`
  - `HARNESS_ADMIN_BEARER_TOKEN` plus `HARNESS_LOGIN_AS_USER_ID`

Example:

```bash
node ./scripts/harness/run-league-read-smoke.js
```

### `run-scrim-lifecycle-smoke.js`

Mutating scrim verification using two actors.

Requirements:

- `HARNESS_API_URL`
- `HARNESS_MUTATION_CONFIRM=YES`
- `HARNESS_GAME_MODE_ID`
- primary auth via bearer token or admin minting
- secondary auth via direct token or `HARNESS_SECONDARY_USER_ID`

### `run-replay-submission-smoke.js`

Mutating replay upload verification.

Requirements:

- `HARNESS_API_URL`
- `HARNESS_MUTATION_CONFIRM=YES`
- `HARNESS_REPLAY_FILE_PATHS`
- primary auth via bearer token or admin minting
- submission via `HARNESS_SUBMISSION_ID` or the current scrim's `submissionId`

Optional:

- `HARNESS_USE_MOCK_COMPLETION=true` with `HARNESS_ADMIN_BEARER_TOKEN`
