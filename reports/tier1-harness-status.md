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

Hosted Tier 1 is built around bearer-token auth.

Preferred operator flow:

1. provide `HARNESS_ADMIN_BEARER_TOKEN`
2. provide `HARNESS_LOGIN_AS_USER_ID`
3. optionally provide `HARNESS_SECONDARY_USER_ID`
4. let the harness mint short-lived user tokens via `loginAsUser`

This is preferable to storing personal long-lived bearer tokens in local env files.

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

## What Is Validated Today

As of March 12, 2026:

- Tier 0 is implemented and successfully run against hosted `main`
- Tier 1 scripts are implemented
- Tier 1 has not yet been fully executed against hosted `main` in this workspace because production-grade actor tokens and replay files were not supplied

## Remaining Execution Blockers

To actually run Tier 1 against hosted `main`, the harness still needs:

1. one admin bearer token or one direct actor bearer token
2. one or two known user IDs for impersonation if admin minting is used
3. one known-safe game mode for scrim validation
4. real replay file paths for submission validation
5. operator judgment on when production mutations are acceptable

## Recommendation

The next step should be:

1. run League Read first on hosted `main`
2. run Scrim Lifecycle with two trusted internal test actors
3. run Replay Submission with dedicated test replay files
4. then promote the same env-contract shape to `v1.5`
