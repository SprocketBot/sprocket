# Tier 1 Harness Status

Updated: March 12, 2026

## Purpose

Record what is now implemented for Tier 1 release verification and what is still blocked on operator credentials or test actors.

## Implemented Scripts

The following Tier 1 scripts now exist:

- `scripts/harness/run-league-read-smoke.js`
- `scripts/harness/run-scrim-lifecycle-smoke.js`
- `scripts/harness/run-replay-submission-smoke.js`

Supporting auth/artifact helper:

- `scripts/harness/node-common.js`

Committed production template:

- `scripts/harness/env/main-prod-tier1.template.env`

## Auth Model

Hosted Tier 1 now supports both direct bearer-token auth and refresh-token-based access-token minting.

Preferred operator flow:

1. provide `HARNESS_ADMIN_REFRESH_TOKEN`
2. provide `HARNESS_LOGIN_AS_USER_ID`
3. optionally provide `HARNESS_SECONDARY_USER_ID`
4. let the harness exchange the refresh token at `/refresh`
5. let the harness mint short-lived user tokens via `loginAsUser`

This is preferable to storing personal short-lived bearer tokens in local env files.

## Coverage Shape

### League Read

Current coverage:

- authenticate
- query `me`
- query season schedule
- pick a fixture
- query fixture details
- assert match and submission state is visible

### Scrim Lifecycle

Current coverage:

- authenticate two actors
- create scrim
- join with second actor
- check in
- poll for scrim progression to `POPPED` or `IN_PROGRESS`

Important note:

This automation currently verifies creation-to-active progression.

It does not yet drive the full scrim all the way through replay-backed completion in one script. That completion boundary overlaps with the replay submission flow.

### Replay Submission

Current coverage:

- authenticate
- resolve submission from env or current scrim
- upload replay files
- poll for post-upload submission state
- optionally trigger admin-only `mockCompletion`

Supported auth inputs:

- `HARNESS_BEARER_TOKEN`
- `HARNESS_REFRESH_TOKEN`
- `HARNESS_ADMIN_BEARER_TOKEN`
- `HARNESS_ADMIN_REFRESH_TOKEN`
- `HARNESS_SECONDARY_BEARER_TOKEN`
- `HARNESS_SECONDARY_REFRESH_TOKEN`

Optional endpoint override:

- `HARNESS_REFRESH_URL`

By default the harness derives the refresh URL from `HARNESS_API_URL` by replacing `/graphql` with `/refresh`.

## What Is Validated Today

As of March 12, 2026:

- Tier 0 is implemented and successfully run against hosted `main`
- Tier 1 scripts are implemented
- refresh-token auth support is implemented for admin, primary, and secondary actors
- the updated Tier 1 scripts were syntax-checked locally
- hosted `main` currently returns `500 Internal Server Error` on `/refresh` because the backend handler reads `req.body.user` instead of `req.user`
- hosted League Read now passes against `main` using direct bearer-token auth and impersonation for primary actor `3001`
- hosted Scrim Lifecycle now gets past auth and join, but is blocked by live mode shape: Rocket League mode `13` (`Doubles`) requires `4` players and the current harness only provisions `2`
- hosted Replay Submission now has replay fixtures configured, but is still blocked because there is no `HARNESS_SUBMISSION_ID` and the current pending scrim has no `submissionId`

## Remaining Execution Blockers

To actually run Tier 1 against hosted `main`, the harness still needs:

1. one admin refresh token, one admin bearer token, or direct actor auth
2. one valid secondary user ID for impersonation if scrim lifecycle is run through admin minting
3. either additional test actors for Rocket League scrim automation or a different Tier 1 scrim target whose mode can pop with two actors
4. real replay file paths for submission validation
5. either a known submission ID or a current scrim with a populated `submissionId`
6. operator judgment on when production mutations are acceptable
7. the `/refresh` handler fix deployed to the hosted environment if refresh-token auth is used

## Recommendation

The next step should be:

1. run League Read first on hosted `main`
2. run Scrim Lifecycle with two trusted internal test actors
3. run Replay Submission with dedicated test replay files
4. then promote the same env-contract shape to `v1.5`
