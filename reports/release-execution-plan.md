# Sprocket Release Execution Plan

Updated: March 12, 2026

## Objective

Turn the current branch/rewrite sprawl into a concrete shipping process.

This plan is intentionally biased toward:

1. getting one customer-facing path moving again quickly,
2. reducing migration uncertainty with evidence,
3. and using agent work for rehearsal, validation, and risk reduction before more rewrite expansion.

## Ground Truth

Current state confirmed from this checkout:

- `main` exists locally
- `dev` exists locally
- `staging` exists locally
- I do not currently see a local/remote ref whose name clearly corresponds to `v1.5`
- `sprocket_dev` should be treated as a convenience checkout of the `dev`/`v2` line
- `Sprocket-v3` remains a separate repo and should be treated as a separate incubation lane

That means Step 0 is not optional: we need to resolve the exact `v1.5` branch/ref before anything else.

## Core Strategy

Do not try to launch `v1.5`, `v2`, and `v3` in parallel.

Instead:

1. make `main` the immediate ship lane,
2. run a formal bake-off for `v1.5`,
3. treat `dev`/`v2` as a bounded migration lane,
4. keep `v3` as a separate slice-based incubation lane,
5. and require every lane to pass the same evidence gates.

## Executable Plan

## Phase 0: Resolve Refs and Set Up Parallel Worktrees

### Goal

Create a clean branch-by-branch evaluation environment.

### Steps

1. Identify the exact `v1.5` branch name.

   Commands:

   ```bash
   git fetch --all --prune
   git branch --all --no-color | rg '1\.5|v1\.5|monolith'
   ```

2. If the `v1.5` ref still does not appear, identify it from your other clones or remote hosting and fetch it explicitly.

   Example:

   ```bash
   git fetch origin <v1.5-branch-name>:refs/remotes/origin/<v1.5-branch-name>
   ```

3. Create dedicated worktrees so all three branches can be evaluated in parallel without disturbing current work.

   Commands:

   ```bash
   git worktree add ../sprocket-main main
   git worktree add ../sprocket-dev-branch dev
   git worktree add ../sprocket-v15 <v1.5-branch-name>
   ```

4. Create a release artifacts folder for branch comparison.

   Commands:

   ```bash
   mkdir -p reports/release-bakeoff
   mkdir -p reports/release-bakeoff/artifacts
   ```

### Deliverables

- three worktrees,
- one confirmed `v1.5` ref,
- one shared location for branch comparison artifacts.

## Phase 1: Produce a Branch Readiness Scorecard

### Goal

Stop reasoning from memory. Start reasoning from observed behavior.

### Scorecard Categories

Each branch gets scored on:

1. installs from scratch,
2. boots locally,
3. runs against local/prod-like data,
4. passes critical golden flows,
5. exposes useful logs/artifacts,
6. has a rollback story,
7. unlocks customer value soon,
8. has manageable migration blast radius.

### Steps

1. Create the scorecard doc.

   File:

   - `reports/release-readiness-scorecard.md`

2. For each worktree, record:

   - checkout commit SHA,
   - install command,
   - boot command,
   - required env/config,
   - known blockers,
   - observed output,
   - pass/fail against each category.

3. Use the same test rubric for all branches. No special pleading.

### Suggested Template

For each branch include:

- ref name
- commit SHA
- local boot status
- migration status
- smoke status
- missing prerequisites
- observed blockers
- estimated path to pilot

### Deliverables

- `reports/release-readiness-scorecard.md`
- one branch comparison entry for `main`
- one for `v1.5`
- one for `dev`

## Phase 2: Define the Golden Flows Once

### Goal

Every branch must prove the same business-critical behaviors.

### Golden Flows

Start with only three:

1. Core API boots and serves a representative GraphQL or primary API health flow.
2. A match/scrim lifecycle path works.
3. A replay/submission path works.

If a branch cannot prove these, it is not a launch candidate.

### Steps

1. Write the canonical flow definitions.

   File:

   - `reports/release-golden-flows.md`

2. For each flow specify:

   - prerequisites,
   - exact commands,
   - expected output,
   - failure evidence to capture.

3. Implement the flows first on `main`, because that is the fastest path to a reusable harness.

4. Port or adapt the same flows to `v1.5` and `dev`.

### Deliverables

- one shared golden-flow document,
- one executable flow per critical area on `main`,
- adapted equivalents on `v1.5` and `dev` where architecture differs.

## Phase 3: Turn `main` Into the Immediate Ship Lane

### Goal

Customer value must start moving again before any platform rewrite cutover.

### Steps

1. Use the current local setup in `main` as the base rehearsal path.

   Known commands already present:

   ```bash
   ./scripts/setup-local.sh --fresh
   ./scripts/setup-local.sh --fresh --seed-db
   docker-compose up -d
   docker-compose exec core npm run migration:run
   ```

2. Add a single release smoke command to `main`.

   Target command:

   ```bash
   npm run dev:smoke
   ```

3. Make that command validate the three golden flows.

4. Capture artifacts into a stable location.

   Target layout:

   ```text
   artifacts/release/
     main/
       logs/
       smoke/
       summaries/
   ```

5. Choose one real customer-facing improvement or operational pain reducer to ship from `main` within the next cycle.

### Deliverables

- a real rehearsal path on `main`,
- artifact-backed smoke validation,
- one short-term ship candidate from `main`.

## Phase 4: Run the `v1.5` Bake-Off

### Goal

Decide quickly whether `v1.5` is a real near-term release path or not.

### Steps

1. Check out the actual `v1.5` branch in its worktree.
2. Record the exact boot/install path.
3. Verify whether the monolith/containerized runtime is actually reproducible.
4. Run the same three golden flows against it.
5. Measure:

   - boot time,
   - memory footprint,
   - functional parity,
   - operator complexity,
   - rollback simplicity.

6. Compare directly against `main`.

### Decision Rule

Promote `v1.5` only if:

1. it boots reproducibly,
2. it passes the same golden flows,
3. it materially improves operational characteristics,
4. and it does not create a worse rollback story.

If any of those fail, park `v1.5` as an optimization branch rather than a release candidate.

### Deliverables

- `reports/release-bakeoff/v15-bakeoff.md`
- branch-specific logs/artifacts
- go/no-go recommendation

## Phase 5: Reduce `dev`/`v2` to One Migration Slice

### Goal

`v2` should not be launched as a whole-platform rewrite. It needs one bounded pilot target.

### Selection Criteria

Pick one capability that is:

1. painful in the current platform,
2. easy to validate,
3. reversible,
4. and low blast radius.

### Good Candidate Types

- operator workflow tooling,
- replay ingestion support path,
- queue decisioning,
- exception handling/triage,
- one bounded admin workflow.

### Steps

1. Create a candidate list.

   File:

   - `reports/v2-slice-candidates.md`

2. Score each candidate on:

   - pain reduced,
   - migration complexity,
   - observability,
   - reversibility,
   - data dependency risk.

3. Pick exactly one.

4. Define a shadow-run plan.

### Deliverables

- a single chosen `v2` pilot slice,
- a shadow-run plan for that slice,
- explicit non-goals for everything else in `dev`.

## Phase 6: Use Agents for Shadow Runs and Diffing

### Goal

Use the harness to compare old vs new behavior before cutover.

### Steps

1. For the chosen `v2` slice, identify representative real inputs.
2. Build a replay harness that feeds equivalent inputs into:

   - current `main` behavior,
   - `v2` slice behavior.

3. Record output diffs.
4. Have the agent summarize:

   - mismatches,
   - probable causes,
   - severity,
   - next-fix recommendations.

5. Repeat until mismatches are understood and acceptable.

### Deliverables

- `reports/v2-shadow-run-results.md`
- reproducible diff artifacts
- prioritized mismatch list

## Phase 7: Keep `v3` on an Incremental Contract

### Goal

Do not let `v3` become another large launch hypothesis.

### Steps

1. Keep using its existing quality/smoke discipline.
2. Choose one production-adjacent workflow only when:

   - `main` is already moving again,
   - `v1.5` has been decided,
   - and `v2` has one active slice max.

3. Require `v3` to meet the same migration gates:

   - boot,
   - smoke,
   - realistic data,
   - shadow or pilot path,
   - rollback.

### Deliverables

- `reports/v3-entry-criteria.md`
- one future candidate slice, not a platform cutover promise

## First 10 Concrete Actions

These are the exact next actions to execute in order.

1. Fetch all refs and identify the exact `v1.5` branch name.
2. Create `main`, `dev`, and `v1.5` worktrees.
3. Create `reports/release-readiness-scorecard.md`.
4. Create `reports/release-golden-flows.md`.
5. Record install/boot/migration steps for `main`.
6. Run `main` locally against the current setup and document blockers.
7. Repeat for `v1.5`.
8. Repeat for `dev`.
9. Build the first shared smoke flow on `main`.
10. Decide whether `v1.5` deserves a second week of work.

## Suggested Command Sequence for the Next Session

```bash
# 1. refresh refs
git fetch --all --prune

# 2. locate v1.5 ref
git branch --all --no-color | rg '1\.5|v1\.5|monolith'

# 3. create comparison worktrees
git worktree add ../sprocket-main main
git worktree add ../sprocket-dev-branch dev
git worktree add ../sprocket-v15 <v1.5-branch-name>

# 4. verify worktrees
git worktree list

# 5. begin main lane validation
cd ../sprocket-main
./scripts/setup-local.sh --fresh

# 6. repeat branch validation in parallel after documenting exact commands
```

## Success Criteria

This plan is working if, within two weeks:

1. `main`, `v1.5`, and `dev` have branch scorecards based on observed behavior,
2. one shared golden-flow set exists,
3. `main` has a real smoke-backed rehearsal path,
4. `v1.5` has been promoted or parked,
5. and `dev` has exactly one migration slice under evaluation.

## Failure Modes to Avoid

Do not do these:

1. expanding `dev`/`v2` scope before a first pilot slice is chosen,
2. assuming `v1.5` is close without a reproducible bake-off,
3. letting `v3` become another broad launch thread right now,
4. or investing in more rewrite code before build/smoke/rehearsal evidence exists.

## Bottom Line

The concrete plan is:

1. normalize the branch comparison setup,
2. score each branch on the same evidence,
3. harden `main` first,
4. force a fast yes/no on `v1.5`,
5. reduce `dev`/`v2` to one pilot slice,
6. and use agents to automate rehearsal, diffing, and migration evidence.

That gives you an executable path from "several promising versions" to "one near-term ship lane and one controlled migration experiment."
