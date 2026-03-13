# Release Readiness Scorecard

Updated: March 12, 2026

## Purpose

This document compares the three active Sprocket release candidates in the main repo lineage:

- `main` (`v1`)
- `personal/gankoji/unbork-cloud-spend` (`v1.5`)
- `dev` (`v2`)

The scorecard is based on observed state from dedicated worktrees, not memory.

## Evaluation Standard

Each branch is evaluated on:

1. branch resolved and isolated,
2. local boot path is documented,
3. install/build path is documented,
4. data/migration path is documented,
5. hosting/deployment path is clear,
6. infra compatibility is understood,
7. critical golden flows can be executed,
8. runtime logs and failure artifacts are obtainable,
9. rollback/cutover story is understandable,
10. near-term customer value is plausible.

Status values:

- `Green`: observed and usable
- `Yellow`: partially present or unverified
- `Red`: missing, unclear, or blocked
- `TBD`: not yet executed

## Worktrees

| Lane | Branch | SHA | Worktree |
| --- | --- | --- | --- |
| `v1` | `main` | `ccd2bc76b8d782f3832288d0173cac691ac3f93e` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main` |
| `v1.5` | `personal/gankoji/unbork-cloud-spend` | `c4aca556256911d476b8a94ce90a084ed9e7bb77` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15` |
| `v2` | `dev` | `d0c1bc9597557674241b73e23d058ec346a5b267` | `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-dev-branch` |

## Summary Table

| Criterion | `main` (`v1`) | `v1.5` | `dev` (`v2`) |
| --- | --- | --- | --- |
| Branch isolated in worktree | Green | Green | Green |
| Local boot path documented | Green | Yellow | Red |
| Install/build path documented | Green | Green | Yellow |
| Data/migration path documented | Green | Yellow | Red |
| Hosting/deployment path clear | Green | Yellow | Red |
| Infra compatibility understood | Green | Yellow | Red |
| Golden flow harness present | Red | Red | Red |
| Logs/artifacts standardized | Red | Red | Red |
| Rollback story understandable | Yellow | Yellow | Red |
| Near-term ship plausibility | Green | Yellow | Yellow |

## Branch Notes

## `main` (`v1`)

### Observed Facts

- Root workspace and `docker-compose.yml` are present.
- Local boot and DB setup are described in `LOCAL_DEVELOPMENT.md`.
- `scripts/setup-local.sh` exists and provides a concrete setup path.
- Production dump and local reseed flow are already documented in `scripts/README.md`.
- The separate infra repo `sprocket-infra` already models the current service topology in Pulumi/Docker Swarm.
- Expected test endpoint is explicit:

```bash
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
```

### Readiness Read

This is the strongest immediate release lane because it already has:

- a documented local runtime,
- a documented migration path,
- an existing infrastructure deployment model,
- and an existing production-shaped operating model.

### Immediate Gaps

- No single release smoke command yet.
- No branch-comparable golden-flow harness yet.
- No standardized failure artifact collection yet.
- Infra deployment verification should be added to the readiness flow, not assumed.

### Next Validation Commands

```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-main
./scripts/setup-local.sh --fresh
docker-compose exec -T core npm run migration:run
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
```

### Status

- Boot path: `Green`
- Hosting path: `Green`
- Smoke path: `Yellow`
- Release readiness: `Yellow`

## `personal/gankoji/unbork-cloud-spend` (`v1.5`)

### Observed Facts

- Root workspace includes `apps/monolith`.
- Root scripts include:
  - `build:monolith`
  - `start:monolith`
  - `dev:monolith`
- `apps/monolith/src/main.ts` and `apps/monolith/src/monolith.module.ts` are checked in.
- `docker-compose.monolith.yml` exists and defines a `monolith` service plus shared infra and the standalone replay parser.
- The monolith is intended to consolidate the major NestJS services into one process while keeping the Python replay parser separate.
- The separate infra repo does not yet show an explicit monolith deployment path.

### Readiness Read

This branch is materially more real than the current `main` checkout made it appear earlier. It has:

- checked-in monolith source,
- root monolith scripts,
- and a dedicated compose file.

That is enough to justify a formal bake-off, but not enough yet to treat hosting as solved.

### Immediate Gaps

- Monolith runtime has not yet been booted and compared against `main`.
- No observed golden-flow pass/fail yet.
- No measured memory/boot-time comparison yet.
- No documented rollback/cutover procedure yet.
- No explicit Pulumi/Swarm deployment mapping has been observed yet.

### Next Validation Commands

```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket-v15
cp .env.local .env
docker-compose -f docker-compose.monolith.yml up --build -d
docker-compose -f docker-compose.monolith.yml logs --tail=200 monolith
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
```

### Status

- Boot path: `Yellow`
- Hosting path: `Yellow`
- Smoke path: `Yellow`
- Release readiness: `Yellow`

## `dev` (`v2`)

### Observed Facts

- Worktree is on branch `dev`.
- Root `package.json` uses `pnpm` for build/lint workflows.
- The root worktree scan did not show an obvious top-level `docker-compose.yml` or `docker-compose.yaml`.
- Root README still describes the older `npm`/microservice workflow and does not currently provide a clear `v2` local boot contract from this worktree alone.
- Separate convenience checkout `/Users/jacbaile/Workspace/MLE/RocketLeague/sprocket_dev` does contain a Bun-based runtime, `docker-compose.yaml`, and setup docs. Since that checkout is being used for workflow convenience, it is likely the practical entry point for `v2` validation.
- No explicit hosting path for this runtime has been observed in `sprocket-infra`.

### Readiness Read

`v2` may have significant implementation progress, but from the branch worktree alone its local boot surface is not yet self-evident. That is a readiness problem in itself.

The key point is not whether `v2` works in principle. The key point is whether it is easy to boot, validate, and compare as a release candidate.

### Immediate Gaps

- Branch-local runtime path is unclear from checked-in root docs.
- No shared smoke harness exists.
- No release candidate scope has been narrowed to one pilot slice.
- No branch-comparable migration story has been documented.
- No infrastructure mapping has been observed.

### Provisional Validation Path

Use the convenience checkout as the practical runtime reference while keeping the scorecard tied to the `dev` branch lineage:

```bash
cd /Users/jacbaile/Workspace/MLE/RocketLeague/sprocket_dev
cp .env.example .env
bun i
docker compose up -d
./migrate-up
./seed
```

### Status

- Boot path: `Red`
- Hosting path: `Red`
- Smoke path: `Red`
- Release readiness: `Red`

## Current Recommendation

1. `main` should remain the immediate ship lane.
2. `v1.5` has earned a real bake-off and should be validated next.
3. `dev`/`v2` should not be treated as a near-term full-platform launch candidate until its boot/validation surface is much clearer.

## Next Actions

1. Run the `main` local rehearsal path and record pass/fail.
2. Run the `v1.5` monolith rehearsal path and record pass/fail.
3. Create the shared golden-flow document.
4. Add artifact capture for both `main` and `v1.5`.
5. Re-evaluate `dev` after deciding whether the authoritative validation path will be the branch worktree or the `sprocket_dev` convenience checkout.
