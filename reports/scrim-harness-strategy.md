# Scrim Harness Strategy

Updated: March 13, 2026

## Recommendation

Use **synthetic Sprocket test users**, but do **not** try to synthesize Rocket League replay files from scratch.

That is the right boundary.

## Why

The current hosted harness findings make two things clear:

1. Rocket League scrim automation needs more than two actors.
2. Replay evidence should be treated as a separate concern from queue/pop state transitions.

The live API currently exposes Rocket League:

- `RL_DOUBLES` (`teamSize=2`, `teamCount=2`, `maxPlayers=4`)
- `RL_STANDARD` (`teamSize=3`, `teamCount=2`, `maxPlayers=6`)

So a durable scrim harness for Rocket League needs either:

- four controlled actors for Doubles, or
- six controlled actors for Standard.

Using recently active real players is a poor fit because:

- every harness run mutates real user state,
- it can grant live scrim points,
- role or skill-group drift breaks the setup,
- and the operator burden never stabilizes.

## Why Not Synthetic Replay Generation

Synthesizing `.replay` files is the wrong first problem.

It is much harder than the rest of the harness work because:

- Rocket League replay files are binary game recordings, not simple JSON fixtures,
- parser behavior depends on realistic player/platform identity data,
- and a synthetic replay generator would itself become a brittle product to maintain.

There is already a much cheaper path in this repo:

- the replay harness supports `HARNESS_USE_MOCK_COMPLETION=true`
- `mockCompletion` can inject stable parsed results after upload
- the replay parser/finalization pipeline can be validated separately from raw replay generation

So the system already has a seam for avoiding replay synthesis.

## Best Practical Model

The best long-term model is:

1. create **four dedicated synthetic Sprocket users** in a dedicated internal test org for Rocket League Doubles
2. keep them out of normal league operations
3. add a reset process so their memberships, skill groups, and auth state can be restored quickly
4. extend the scrim harness to support four actors for the Rocket League scrim CUJ
5. keep replay validation partially decoupled from scrim-state validation

## Replay Strategy

Use a two-layer replay strategy.

### Layer A: Stable Pipeline Validation

Goal:

- prove upload, submission progression, and downstream wiring

Approach:

- use a dedicated submission target
- upload a small set of stable replay fixtures
- use `HARNESS_USE_MOCK_COMPLETION=true` where full parser realism is not required

This gives cheap, repeatable validation of the Sprocket-side workflow.

### Layer B: Real Replay Corpus

Goal:

- prove the real parser/finalization path still works with realistic account identities

Approach:

- capture a small golden corpus of real replays once
- store them as internal test fixtures
- replay them only in non-production or isolated beta environments

The important point is that these replays do **not** need to come from live customer accounts or recently active scrim players every time.

The better source is a one-time, controlled set of real matches recorded by dedicated internal test accounts.

## Concrete Recommendation For Sprocket

Do this in order:

1. stop considering “recent real players” the steady-state scrim harness input
2. create four dedicated internal Rocket League test users
3. extend the scrim harness from two actors to four actors for the Doubles CUJ
4. separate “scrim reaches popped/in-progress” from “submission gets replay evidence”
5. use `mockCompletion` for the first stable replay-submission automation
6. later add a small curated golden replay corpus captured from controlled internal accounts

## What I Would Not Do

I would not:

- run the harness repeatedly on real recently active players
- depend on ranked/eligibility-sensitive customer accounts
- try to generate `.replay` binaries synthetically as a prerequisite for harness progress

That would create more maintenance burden than it removes.

## Immediate Next Step

The next highest-value move is:

1. provision four dedicated internal Rocket League test users
2. keep the current replay harness path pointed at `mockCompletion`
3. treat real replay-corpus capture as a later fixture-creation task, not a blocker for scrim automation
