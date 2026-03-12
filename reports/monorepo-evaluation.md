# Monorepo Evaluation

Updated: March 12, 2026

## Question

Should `sprocket` and `sprocket-infra` be combined into a single monorepo?

## Short Answer

Yes, probably.

But not as a big-bang rewrite, and not by flattening everything into one giant package workspace.

The right move is a **deployment monorepo**:

- one git repo,
- separate top-level `app/` and `infra/` domains,
- shared root automation,
- shared release docs and harnesses,
- but preserved runtime and deployment boundaries.

## Why This Would Help

The current release problem is not just "too much code."

It is that:

1. app changes live in one repo,
2. hosting changes live in another repo,
3. release validation has to span both,
4. and branch/stack/image relationships are mostly tracked in human memory.

That is exactly the kind of situation where an agent-first process gets weaker:

- the context is split,
- the working tree is split,
- commits are split,
- and the proof loop is split.

For the specific work we are doing now, a monorepo would directly improve:

1. branch bake-offs across `main`, `v1.5`, and `v2`
2. beta-lane infra + app coordination
3. release harness implementation
4. artifact collection and auditability
5. agent ability to make repo-wide but still coherent changes

## What Problems It Solves

### 1. Atomic Release Work

Right now, "make `v1.5` deployable" naturally requires:

- app changes,
- infra changes,
- harness changes,
- docs changes.

Those belong in one reviewed unit more often than not.

### 2. One Source of Truth for Release State

A monorepo can hold:

- app branch/ref,
- infra stack definition,
- harness profile,
- rollout checklist,
- verification artifacts contract,
- release scorecard.

That is much closer to the actual operational unit.

### 3. Better Agent Leverage

The OpenAI-style process gets stronger when the environment is self-contained.

If the agent can inspect:

- app topology,
- infra topology,
- smoke commands,
- stack configs,
- rollout docs,

in one repo, it can do much better uncertainty reduction.

### 4. Easier Variant Management

You do not actually have one product.

You currently have:

- `v1`
- `v1.5`
- `v2`
- `v3` experiments
- and one live infra model

A monorepo makes it easier to define:

- which variant maps to which infra lane,
- which harness profile validates which lane,
- which rollout artifacts apply to which candidate.

## What It Does Not Solve Automatically

A monorepo does **not** fix:

- poor release criteria,
- missing smoke coverage,
- missing test data,
- missing secrets/process discipline,
- or unclear ownership.

If those remain weak, a monorepo just centralizes the mess.

## Main Risks

### 1. Big-Bang Migration Cost

If you try to merge both repos and redesign all workflows at once, it will stall the actual delivery work.

### 2. CI/Tooling Churn

You need path-based CI, path-based deploy logic, and a clear root command surface.

Otherwise every change starts rebuilding or redeploying everything.

### 3. Blast Radius in Review

If boundaries are not preserved, "touch app + infra" can quickly become "everything changes together."

That is worse, not better.

## Recommended Shape

Use one repo with explicit domains:

```text
/app
/infra
/reports
/scripts/harness
/release
```

Suggested mapping:

- `/app` = current `sprocket`
- `/infra` = current `sprocket-infra`
- `/reports` = planning, rollout, verification, readiness docs
- `/scripts/harness` = shared release validation and artifact collection
- `/release` = environment contracts, stack manifests, lane mappings

## Important Constraint

Do **not** merge the Node workspace and the Pulumi workspace into one package-manager domain.

Keep them logically separate:

- app builds still behave like app builds,
- infra deploys still behave like infra deploys,
- root automation just orchestrates them.

## Migration Recommendation

Do this in stages.

### Stage 1: Operational Monorepo

Create a new combined repo or import one repo into the other with history preserved.

Goal:

- one git root,
- no major code restructuring yet.

### Stage 2: Shared Root Automation

Add root commands for:

- release validation
- stack selection
- app image tagging
- beta environment bring-up
- artifact collection

### Stage 3: Shared Release Metadata

Add machine-readable files for:

- lane definitions
- environment contracts
- branch-to-stack mapping
- image-tag policy
- smoke-profile definitions

### Stage 4: Path-Based CI/CD

Ensure:

- app-only changes do not trigger unnecessary infra work
- infra-only changes do not trigger unnecessary app builds
- coordinated release changes can still run end to end

## Recommended Merge Method

Best practical option:

- preserve both histories,
- import `sprocket-infra` under a top-level `infra/` directory,
- keep the current app repo structure under `app/` or keep the app repo at root and import infra under `infra/`.

For least disruption to current work, I would recommend:

- keep the current `sprocket` layout as the root,
- import `sprocket-infra` under `infra/sprocket-infra/`.

That minimizes churn to the app repo while still giving the agent and the release process one coherent tree.

## Recommendation

I think this is a good idea and likely a net positive.

But I would not pause the current release-harness work to do a perfect repo redesign first.

The right move is:

1. continue the current harness and beta-lane work,
2. plan the monorepo as a controlled migration,
3. adopt it in a way that accelerates release work instead of becoming a separate project.

## Practical Decision

If you want the shortest path:

- yes to a monorepo,
- no to a big-bang restructure,
- yes to importing infra into the current repo with boundaries preserved,
- and yes to making release/harness work the first cross-domain workflow it supports.
