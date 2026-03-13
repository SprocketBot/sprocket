# Sprocket Release Portfolio Plan

Updated: March 12, 2026

## Why This Document Exists

Sprocket currently has multiple overlapping platform efforts:

- the current `sprocket` codebase,
- a `v1.5` line that exists as a branch in this repo,
- a `v2` line that also exists as the `dev` branch in this repo,
- a second local working copy at `sprocket_dev` used for easier workflow against that `dev`/`v2` line,
- and the separate `Sprocket-v3` repo with a Go + Kubernetes-based platform.

These efforts all occupy roughly the same product space, but they are not equally close to customer value. Without a portfolio strategy, the likely outcome is continued internal progress with limited production impact.

This document defines how to use the agent/harness process to turn the current situation into a shipping plan instead of a queue of parallel rewrites.

## Current Reality

### 1. The current `sprocket` repo is the shortest path to customer value

This repo already has:

- a complete multi-service application shape,
- Docker-based local environment setup,
- a production DB dump path,
- existing service tests,
- and a known operational model.

It also now has internal planning artifacts around architecture and an initial agent-harness roadmap.

### 2. `v1.5` exists as a branch, but is not yet a validated release lane from the current working copy

As of March 12, 2026, from the current working copy and files inspected here:

- there is no checked-in `apps/monolith/src`,
- there is no root `start:monolith` flow,
- and the main explicit monolith artifact in this repo is `reports/monolith-migration-prompt.md`.

There is leftover build output under `apps/monolith/dist`, but that is not enough to treat `v1.5` as a real release candidate.

That does not mean `v1.5` does not exist. It means the current checked-out branch does not yet present it as a validated, reproducible release target.

Conclusion:

`v1.5` should be considered a recovery candidate only if the `v1.5` branch can be checked out, built, and validated with a reproducible path quickly.

### 3. `v2` is the `dev` branch in this repo; `sprocket_dev` is a convenience working copy

The `sprocket_dev` working copy already has:

- a Bun workspace,
- a new local Docker-based runtime,
- a consolidated `core`,
- web and Discord clients,
- tracing/observability setup,
- and local migration/seed steps.

That is promising, but there is not yet strong evidence here of the same slice-by-slice smoke discipline that exists in `Sprocket-v3`.

Conclusion:

Treat `v2` as a capability incubation branch, not as a broad launch candidate, regardless of whether it is accessed via the main repo's `dev` branch or the separate local `sprocket_dev` checkout.

### 4. `Sprocket-v3` is more operationally disciplined than the other rewrite lanes

The `Sprocket-v3` repo already has:

- a clear README and execution board,
- a weekly slice model,
- local smoke scripts,
- minikube smoke scripts,
- seeding scripts,
- a quality gate,
- and a roadmap completed through Week 14 as of February 15, 2026.

That means `v3` is not the least mature lane. In process terms, it is arguably the most mature. But it is still a separate platform.

Conclusion:

`v3` is the strongest place to borrow harness/process patterns from, but should still not be launched as a big-bang replacement.

## Core Recommendation

Stop framing the problem as "which whole platform should launch?"

Instead, frame it as:

1. What is the fastest safe path to more customer value in the next 30-60 days?
2. What evidence do we need before any rewrite lane is allowed to replace production responsibilities?
3. How do we use agents to reduce uncertainty, not multiply parallel bets?

## Portfolio Decision

Going forward, the three lanes should have different jobs.

### Lane A: `sprocket` is the production value lane

This is the lane that should ship customer-facing improvements soonest.

Near-term mission:

- stabilize current operations,
- improve local/prod rehearsal,
- harden release confidence,
- and ship the highest-leverage operational/customer improvements now.

This is where the first harness investment should land.

### Lane B: `v2` (`dev` branch, optionally worked via `sprocket_dev`) is the selective extraction lane

This lane should not be launched as "the new platform" in one move.

Its job should be:

- proving specific architectural ideas,
- hardening specific capabilities,
- and earning production adoption one bounded slice at a time.

If a slice in `v2` cannot be validated independently and migrated incrementally, it is not ready.

### Lane C: `v3` is the long-horizon replacement research lane

This lane has the best process discipline today, but it should still be required to earn production scope incrementally.

Its job should be:

- continue proving the Go + K8s operating model,
- keep weekly slice validation strong,
- and target one narrow production-adjacent capability rather than a platform-wide cutover.

## What "Using the New Process" Actually Means Here

The new process should not be used first to write more rewrite code.

It should be used to build the launch and migration machinery you currently lack:

- inventory,
- readiness scorecards,
- rehearsal environments,
- smoke suites,
- migration diffing,
- shadow-run tooling,
- runbooks,
- and cutover checklists.

That is how agents help turn internal work into shippable work.

## Immediate Strategic Shift

For the next phase, you should work on three questions in order:

1. Can current `sprocket` be turned into a safe, rehearseable release lane?
2. Can the `v1.5` branch be made into a real artifact, or should it be retired as a near-term idea?
3. Which single capability from `v2` or `v3` is most worth proving in production first?

Do not run all three platforms toward full launch simultaneously.

## Recommended 6-Week Plan

## Week 1: Build the release board and readiness scorecards

Create a single decision board that compares `v1`, `v1.5`, `v2`, and `v3` on:

- runnable locally,
- reproducible build,
- migration path,
- smoke coverage,
- prod data rehearsal,
- observability,
- rollback story,
- operator training burden,
- and customer-visible value unlocked.

Output artifacts:

- `reports/release-readiness-scorecard.md`
- `reports/release-lane-comparison.md`
- `reports/cutover-risk-register.md`

Primary outcome:

Make it impossible for a lane to feel "close" without evidence.

## Week 2: Turn `sprocket` into a production rehearsal lane

Use the current repo's existing local setup and production dump scripts as the base.

Add or formalize:

- one-command local rehearsal using a recent sanitized or limited production snapshot,
- system smoke checks for critical customer flows,
- artifact capture for failures,
- and a checklist for "would I be comfortable deploying this tomorrow?"

Primary outcome:

Current `sprocket` becomes something you can trust enough to change.

## Week 3: Decide whether `v1.5` is real

This should be a hard gate week, not an open-ended implementation week.

Questions to answer on the actual `v1.5` branch:

1. Where is the actual monolith source of truth?
2. Can it be built from source in one command?
3. Can it boot against a local prod-like snapshot?
4. Can it execute the same golden flows as current `sprocket`?
5. Is there a rollback story if it fails under real load?

Decision rule:

- If yes, put `v1.5` into a formal bake-off against current `sprocket`.
- If no, stop treating it as an active release path until source and validation exist.

## Week 4: Choose one rewrite slice, not one rewrite platform

Pick exactly one bounded candidate capability from `v2` or `v3`.

Good candidates are:

- high operational pain,
- clear acceptance criteria,
- low blast radius,
- and reversible integration.

Bad candidates are:

- authentication platform replacement,
- whole-database cutover,
- or broad UI replacement without a fallback.

The goal is not "launch v2" or "launch v3". The goal is "replace one painful workflow safely."

## Week 5: Build shadow-run or parallel-run infrastructure

For the chosen slice:

- feed representative input into both old and new implementations,
- compare outputs,
- record diffs,
- and quantify mismatches.

This is where agents can provide real leverage:

- generating test fixtures,
- replaying real events,
- collecting logs,
- summarizing mismatches,
- and opening targeted fixes.

Primary outcome:

Migration risk becomes measured instead of guessed.

## Week 6: Decide on the first customer-visible release

At this point, the likely options should be:

1. Ship a hardened improvement on current `sprocket`.
2. Pilot `v1.5` if it passed the bake-off.
3. Pilot one bounded capability from `v2` or `v3` behind a controlled switch.

If none of those has evidence, the right answer is not "push harder on all fronts." The right answer is to keep narrowing until one path does.

## Recommended Shipping Order

### First ship: current `sprocket` plus harness hardening

This is the fastest route to real customer value because it avoids platform cutover risk.

Use agents to:

- add reproducible setup,
- add critical flow smoke tests,
- add logs/artifact collection,
- add release checklists,
- and reduce operator pain in the current system.

### Second ship: `v1.5` only if it can be turned into a measurable bake-off candidate

`v1.5` only makes sense if it can be tested against the same flows and same data as current `sprocket`.

If it cannot, it is not the next release. It is a parked idea.

### Third ship: one narrow `v2` or `v3` slice

This should be a strangler move, not a platform launch.

Examples of acceptable first moves:

- an exception automation workflow,
- a replay ingestion/validation sidecar,
- a queue/scrim decision engine behind mirrored inputs,
- or an ops-facing tool that does not own the whole customer journey.

## What Agents Should Do First

Use agents for uncertainty reduction work, not platform fantasy work.

Highest-value agent tasks:

1. Inventory all launch blockers by lane.
2. Produce runnable checklists for each repo.
3. Create readiness scorecards from observed evidence.
4. Build/repair local rehearsal environments.
5. Write and run golden-flow smoke tests.
6. Create diff tooling for shadow runs.
7. Summarize mismatches and open small targeted fixes.
8. Maintain a migration risk register and update it every run.

Lower-value agent tasks right now:

- adding more architecture to a rewrite lane that still lacks a migration path,
- speculative abstraction work,
- or broad platform churn without a release hypothesis.

## Migration Risk Reduction Model

Every rewrite candidate should be required to pass this sequence:

1. Build from source.
2. Boot locally with one command.
3. Run against realistic data.
4. Pass golden-flow smoke.
5. Produce structured logs and artifacts.
6. Survive repeated rehearsal.
7. Run in parallel or shadow mode.
8. Prove rollback is straightforward.
9. Pilot with a bounded audience or bounded workflow.
10. Only then expand scope.

If a lane cannot pass Step 1 through Step 4, it is not a launch candidate.

## Concrete Recommendation on `v1.5`, `v2`, and `v3`

### `v1.5`

Current recommendation:

- treat as an investigation with a one-week deadline,
- not as an assumed release.

Desired end state:

- either promoted into a bake-off candidate,
- or explicitly parked.

### `v2`

Current recommendation:

- do not launch wholesale,
- identify one slice worth extracting or piloting,
- and require a migration contract before new work expands.

Desired end state:

- one capability proves it can coexist with current `sprocket`.

### `v3`

Current recommendation:

- preserve its strong slice/testing discipline,
- use it as the process model,
- and require the same incremental migration standard as `v2`.

Desired end state:

- one production-adjacent workflow is proven under parallel or pilot conditions.

## Decision Heuristics

When choosing where to spend time, prefer work that:

1. decreases uncertainty,
2. improves release confidence,
3. shortens time to first customer value,
4. is reversible,
5. and generates reusable harness/process assets.

Avoid work that:

1. requires platform-wide cutover belief,
2. has no measured rehearsal path,
3. depends on undocumented tribal knowledge,
4. or cannot be evaluated against real workflows.

## Bottom Line

The fastest way to make more of this work real is not to accelerate all platform efforts equally.

It is to:

1. make the current system safer to ship,
2. force `v1.5` to become real or be demoted,
3. reduce `v2` and `v3` to one slice at a time,
4. and use agents to build the harness that turns migration risk into measurable evidence.

That is the path from "lots of promising work in the same space" to "customers are getting improvements again."
