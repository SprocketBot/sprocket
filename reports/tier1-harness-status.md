# Tier 1 Harness Status

Updated: April 21, 2026

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

As of April 21, 2026:

- Tier 0 is implemented and successfully run against hosted `main`
- Tier 1 scripts are implemented
- refresh-token auth support is implemented for admin, primary, and secondary actors
- the updated Tier 1 scripts were syntax-checked locally
- **OAuth Refresh Handler fix verified**: `core/src/identity/auth/oauth/oauth.controller.ts:64` correctly reads `req.user` instead of `req.body.user` (commit `ac67d0c4`, March 12, 2026); TypeScript compilation passes
- **Async Replay Submission fix verified**: `common/src/celery/celery.service.ts:72-112` correctly returns taskIds immediately without blocking on `asyncResult.get()`; background callback invokes completion handlers asynchronously; TypeScript compilation passes for `common` and `@sprocketbot/submission-service`
- both fixes are present in branch `issue/tier1-harness-fixes` and base commit `70732f1d`
- hosted League Read now passes against `main` using direct bearer-token auth and impersonation for primary actor `3001`
- hosted Scrim Lifecycle now passes against `main` with four dedicated Rocket League test users (`6404`, `6405`, `6406`, `6407`) and reaches `IN_PROGRESS` with a real `submissionId`
- hosted Replay Submission now gets through auth, submission targeting, and multipart upload formatting, but the live `parseReplays` mutation currently times out server-side (requires deployment of async fix)
- four dedicated Rocket League test users now exist for the planned four-actor scrim path: `6404`, `6405`, `6406`, `6407`
- the scrim harness now accepts `HARNESS_SCRIM_ACTOR_USER_IDS` / `HARNESS_SCRIM_ACTOR_BEARER_TOKENS` for ordered multi-actor runs while preserving the legacy two-actor fallback

## Remaining Execution Blockers

To actually run Tier 1 against hosted `main`, the harness still needs:

1. one admin refresh token, one admin bearer token, or direct actor auth
2. one valid secondary user ID for impersonation if scrim lifecycle is run through admin minting
3. **deployment of the async replay-submission fix** to hosted `main` so `parseReplays` returns task IDs immediately instead of timing out (code fix verified complete in `common/src/celery/celery.service.ts:72-112`)
4. real replay file paths for submission validation
5. operator judgment on when production mutations are acceptable
6. **deployment of the `/refresh` handler fix** to hosted `main` if refresh-token auth is used (code fix verified complete in `core/src/identity/auth/oauth/oauth.controller.ts:64`)

## Recommendation

The next step should be:

1. run League Read first on hosted `main`
2. run Scrim Lifecycle with two trusted internal test actors
3. run Replay Submission with dedicated test replay files
4. then promote the same env-contract shape to `v1.5`
