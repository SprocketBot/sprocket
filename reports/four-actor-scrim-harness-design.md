# Four-Actor Scrim Harness Design

Updated: March 13, 2026

## Purpose

Define the implementation shape for extending the current two-actor scrim harness to support Rocket League Doubles on hosted environments.

The actor-list contract described here is now implemented in the scrim runner, though it has not yet been fully validated against hosted `main` with the provisioned four-user set.

## Why This Is Needed

The live Rocket League mode inventory currently exposes:

- `RL_DOUBLES` with `teamSize=2`, `teamCount=2`, `maxPlayers=4`
- `RL_STANDARD` with `teamSize=3`, `teamCount=2`, `maxPlayers=6`

The current scrim harness only provisions two actors, so it cannot pop a live Rocket League scrim and therefore cannot reach a scrim-backed `submissionId`.

## Design Goal

Keep the existing single-actor and two-actor Tier 1 env shape intact for:

- League Read
- Replay Submission
- current auth helpers

Add a **scrim-specific** multi-actor contract rather than overloading the existing primary/secondary variables.

## Proposed Env Contract

### Shared Auth

Preferred:

- `HARNESS_ADMIN_REFRESH_TOKEN`

Fallback:

- `HARNESS_ADMIN_BEARER_TOKEN`

Shared org context:

- `HARNESS_ORGANIZATION_ID`

### Four-Actor Scrim Inputs

Required:

- `HARNESS_SCRIM_ACTOR_USER_IDS`
  - comma-separated user IDs in join order
  - example: `3001,3000,3002,3003`
- `HARNESS_GAME_MODE_ID`
  - for current Rocket League Doubles, this is `13`
- `HARNESS_MUTATION_CONFIRM=YES`

Optional:

- `HARNESS_SCRIM_ACTOR_BEARER_TOKENS`
  - comma-separated bearer tokens matching actor order
  - only needed if not minting via admin auth
- `HARNESS_LEAVE_AFTER`
  - default `1`
- `HARNESS_REQUIRE_CHECKIN`
  - default `true`
- `HARNESS_CREATE_GROUP`
  - default `false`
- `HARNESS_SCRIM_GROUP_ASSIGNMENTS`
  - optional comma-separated group labels matching actor order
  - example: `A,A,B,B`
- `HARNESS_SCRIM_EXPECTED_MAX_PLAYERS`
  - optional guardrail; recommended value `4` for Doubles
- `HARNESS_SCRIM_POLL_ATTEMPTS`
- `HARNESS_SCRIM_POLL_INTERVAL_MS`

## Why This Contract

`HARNESS_SCRIM_ACTOR_USER_IDS` is better than introducing:

- `HARNESS_TERTIARY_USER_ID`
- `HARNESS_QUATERNARY_USER_ID`

because:

- it scales to future six-player Standard support,
- it keeps the scrim harness generic,
- and it avoids spreading actor-count assumptions into the rest of the Tier 1 harness.

## Proposed Execution Flow

1. Read `HARNESS_SCRIM_ACTOR_USER_IDS`.
2. Fail unless actor count is at least `4` for Rocket League Doubles.
3. Resolve one token per actor:
   - direct bearer token if provided in `HARNESS_SCRIM_ACTOR_BEARER_TOKENS`
   - otherwise mint via admin auth
4. Query `me` and `currentScrim` for every actor.
5. Fail fast if any actor is already in a live scrim.
6. Query game-mode metadata and verify:
   - expected game mode exists
   - actor count matches `teamSize * teamCount`
7. Create scrim with actor 1.
8. Join actors 2..N in order.
9. Poll until scrim reaches `POPPED`.
10. If check-in is enabled, check in all actors.
11. Poll until scrim reaches `IN_PROGRESS`.
12. Capture:
   - `scrimId`
   - `submissionId`
   - actor names
   - player counts
   - checked-in actors
13. Return success or hand off to replay submission.

## Guardrails

The four-actor harness should fail early when:

- actor count is less than mode `maxPlayers`
- actor count is greater than mode `maxPlayers`
- actor tokens and actor IDs disagree in count
- any actor is already in a scrim
- the created scrim remains `PENDING` because actor count is insufficient
- `submissionId` is still null after `IN_PROGRESS`

## Artifact Expectations

The multi-actor run should preserve the same artifact convention but add per-actor labels:

- `actor-1-me`
- `actor-2-me`
- `actor-3-me`
- `actor-4-me`
- `actor-1-current-before`
- `actor-2-current-before`
- and so on

The summary should include:

- ordered actor list
- game mode metadata
- `scrimId`
- `submissionId`
- final status
- player count and max players
- checked-in actors

## Implementation Notes

The cleanest implementation path is:

1. add a small helper in `node-common.js` to resolve a list of actor tokens from:
   - actor bearer tokens, or
   - admin impersonation plus actor user IDs
2. refactor `run-scrim-lifecycle-smoke.js` from `primary/secondary` logic into ordered actor-array logic
3. preserve backward compatibility by:
   - supporting current two-actor env vars for now
   - preferring `HARNESS_SCRIM_ACTOR_USER_IDS` when present

## Recommended Rollout

1. Add the new env contract and list-based actor resolution.
2. Keep current two-actor support as a fallback.
3. Move hosted Rocket League scrim validation to the four-actor path.
4. Only after that, wire replay submission to consume the captured `submissionId`.

## Provisioned Actor Set

As of March 13, 2026, the first dedicated hosted Rocket League test users are available:

- `6404`
- `6405`
- `6406`
- `6407`

These should become the first `HARNESS_SCRIM_ACTOR_USER_IDS` set for the Doubles path:

- `6404,6405,6406,6407`
