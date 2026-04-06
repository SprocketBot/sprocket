# Production rollback: application images (immutable tags)

**Audience**: On-call engineers and infra operators  
**Scope**: Rolling back **Sprocket application services** deployed from the `infra/platform` Pulumi stack (`prod`) by pinning **immutable container image tags** and re-running Pulumi.  
**Out of scope**: Database restore from backup, foundation droplet rebuild, Vault operations — use separate runbooks.

---

## Why immutable tags (not `:main` alone)

Production services pull images from GHCR. The platform program resolves each `image-tag` to a **digest** at deploy time (`getImageSha` in `infra/global/helpers/docker/getImageSha.ts`), but the tag you pass in must still identify the **correct build**.

- **Mutable tags** (for example `:main`) move forward whenever CI publishes a new image. During an incident, “set tag back to `main`” does **not** restore a previous build; it only means “whatever `main` points to **right now**,” which may still be broken.
- **Immutable tags** (for example `git-<full-or-short-sha>` or another CI-published tag that is never moved) let you redeploy the **exact** images that were running when things were healthy.

Keep a record of the last known-good tag or SHA from CI history, a deployment BOM artifact (see [#671](https://github.com/SprocketBot/sprocket/issues/671)), or `pulumi stack export` (search the export for `ghcr.io` / digest references).

---

## When to roll back (symptoms)

Typical signals that an **application image** rollback is appropriate:

- Elevated 5xx, timeouts, or health-check failures right after a **platform** deploy.
- Regressions traced to **application code** (crashes, bad feature flag behavior) with no DB-only explanation.
- A **bad image** is clearly identified (wrong tag promoted, faulty build).

Prefer **forward fix** (new deploy) when a patch is minutes away; use rollback when you need to restore service quickly with a known-good artifact.

---

## DNS / Traefik vs images only

| Situation | What to roll back |
|-----------|-------------------|
| Bad **routing**, TLS, or Traefik behavior after a **`layer_1`** change | Address **`infra/layer_1`** (and possibly DNS) with the same discipline: identify last good revision, `pulumi preview` / `pulumi up` for that stack, with approvals. |
| Bad **application** behavior after a **`platform`** deploy | Roll back **`infra/platform`** `prod` **image-tag** (this document). |
| DNS points at the wrong host or record | Fix DNS / foundation as appropriate — not covered here. |

If the incident started immediately after **only** a database migration, rolling back images **without** a schema/compat plan can make things worse. See pre-rollback checks below.

---

## Pre-rollback checks

1. **Confirm blast radius**  
   - Is it one service or the whole platform? Use Gatus, Grafana, and Swarm (`docker service ls`, `docker service ps`, logs on the manager — see [`OPERATIONS_RUNBOOK.md`](./OPERATIONS_RUNBOOK.md)).

2. **Rule out “DB migration only”**  
   - If the bad deploy included a **schema migration** and newer code expects the new schema, rolling back **images** to older code can cause crashes or data errors.  
   - If you suspect migration mismatch, **stop** and escalate: you may need a forward fix or DBA/runbook procedures, not a simple image rollback.

3. **Identify what changed**  
   - Recent merges to `main`, recent **Infra Pulumi** workflow runs, and recent image pushes should narrow whether `platform`, `layer_1`, or `layer_2` moved.

---

## Step 1 — Identify last known-good `git` SHA / image tag

Use one or more of:

1. **GitHub Actions** — workflow runs that built or deployed the application; job summaries, logs, or artifacts often list the git SHA or image tag.
2. **GHCR** — packages for `sprocketbot` (or your configured `image-namespace`); confirm the tag still exists (for example `git-<sha>`).
3. **Deployment BOM** — when available, the BOM from [#671](https://github.com/SprocketBot/sprocket/issues/671) should list deployed digests or tags.
4. **`pulumi stack export`** — export the `prod` stack and search for `ghcr.io` / digest lines to see what was last applied (works best if you have a recent export from a healthy state).

Record the **exact** tag string you will set (for example `git-abc1234…`). All application services in the main platform path share the stack config key **`image-tag`** (`platform:image-tag` in stack config).

**Legacy note**: Some legacy bot/worker images in code still reference fixed tags such as `master`; this runbook focuses on the primary **`platform:image-tag`** contract for current Sprocket services. If legacy services are implicated, escalate — do not assume one key fixes them all.

---

## Step 2 — Pin `image-tag` on the `prod` stack

**Canonical config key**: `image-tag` on Pulumi project **`platform`**, stack **`prod`**.

### Option A — Set stack config in place (usual for a hot rollback)

From a machine that can reach the Pulumi backend and (for `up`) the remote Docker host:

```bash
cd /path/to/sprocket
nvm use
npm run infra:install

export PULUMI_BACKEND_URL='s3://<bucket>/pulumi?endpoint=<https://...>'   # placeholder
pulumi login "$PULUMI_BACKEND_URL"   # if not already logged in

cd infra/platform
pulumi stack select prod
pulumi config set image-tag git-<YOUR_KNOWN_GOOD_SHA>   # placeholder: use the real immutable tag
```

Do **not** paste secrets into chat or tickets; use your normal shell / 1Password / vault flow.

### Option B — Commit a tag change in git (when policy prefers a PR)

1. On a branch, edit **`infra/platform/Pulumi.prod.yaml`** and set `platform:image-tag` to the immutable tag (this file also contains secrets — **never** commit real secret values; only change the image tag line in a controlled PR).
2. Merge via normal review, then deploy using the same preview/apply path as any other prod change.

The **live** stack may still store config in the Pulumi backend; ensure backend and repo expectations match your team’s process. For an emergency, Option A is usually faster.

---

## Step 3 — `pulumi preview` then `pulumi up`

### Path 1 — GitHub Actions (no production SSH required for the runner)

The **Infra Pulumi** workflow supports **`workflow_dispatch`**: `.github/workflows/infra-pulumi.yml`.

1. Ensure stack config (Option A or B) already points at the good **`image-tag`**. After **`pulumi config set`** (Option A), the value is stored in the **Pulumi backend**; a **GitHub Actions** run still checks out `main`, but `pulumi up` reads stack config from the backend, so the new tag applies even if `Pulumi.prod.yaml` in git was not updated yet. Option B updates the committed YAML and relies on the normal merge + deploy path.
2. In GitHub: **Actions** → **Infra Pulumi** → **Run workflow**.
3. Set inputs, for example:
   - **stack_project**: `platform`
   - **stack_name**: `prod`
   - **command**: `preview` first; after review, run again with **`up`**
4. For **`up`**, the workflow uses the **`production`** GitHub Environment — **required reviewers** must approve (see [`CICD_STRATEGY.md`](./CICD_STRATEGY.md)).

Reusable action contract: `.github/reusable_workflows/pulumi_up/action.yaml` (Tailscale + remote `DOCKER_HOST`, same as laptop).

### Path 2 — Break-glass laptop / bastion (approved maintainer)

When CI is unavailable or policy allows direct apply, use the repo’s standard off-node commands (Tailscale + SSH to Docker manager), documented in [`infra/README.md`](../README.md) and [`scripts/infra/README.md`](../../scripts/infra/README.md):

```bash
export DOCKER_HOST=ssh://<SSH_USER>@<MANAGER_HOST>   # placeholders
export PULUMI_BACKEND_URL='s3://<bucket>/pulumi?endpoint=<https://...>'

npm run infra:preview -- platform prod
npm run infra:up -- platform prod --yes
```

`infra:up` runs a preview first unless `PULUMI_SKIP_PREVIEW=1` is set.

---

## Step 4 — Verify (Tier 0 / Tier 1, read-only where possible)

After apply:

1. **Swarm**: services show expected replicas; image references updated (`docker service ls`, `docker service ps <name> --no-trunc`).
2. **Synthetic / uptime**: Gatus and critical user paths (see [`OPERATIONS_RUNBOOK.md`](./OPERATIONS_RUNBOOK.md)).
3. **Harness** (if credentials available): from repo root, prefer read-only smoke first, for example:
   - `npm run verify:tier0 -- main-prod`
   - Tier 1 only with an operator profile and explicit approval: `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env <suite>`

Document what was run and the result in the incident thread.

---

## Post-rollback

1. **Incident note** — timeline, bad tag, good tag, approver, verification evidence.
2. **`main` branch** — if a bad merge must not drive the next deploy, revert or fix forward as the team agrees; ensure CI does not republish a broken default.
3. **Follow-up** — if rollback depended on laptop access, consider tracking automation so production applies stay **approval-gated in Actions** only ([`CICD_STRATEGY.md`](./CICD_STRATEGY.md) rollout).

---

## Emergency `docker service update --rollback` (Swarm only)

`docker service update --rollback <service>` reverts to the **previous Swarm service spec** on the node. It can be a short-term bridge during an outage, but **Pulumi state and stack config can drift** from reality. After stabilizing, align the stack **`image-tag`** and run **`pulumi up`** so the declared infrastructure matches what is running.

---

## Tabletop exercise (acceptance / training)

Before relying on this in an incident, run a **tabletop** on a **non-prod** stack or lane (for example a beta/staging `platform` stack if your org has one):

1. Record current `image-tag`.
2. Temporarily set `image-tag` to **another** immutable tag you control.
3. Run **`preview`** and a test **`up`** with the same path you use for prod (Actions or laptop).
4. Restore the original tag and apply again.

Adjust steps if your staging stack name or config differs. The goal is to prove navigation of GitHub, Pulumi backend login, and approvals — not to rehearse prod secrets in a public channel.

---

## Related documentation

- [`OPERATIONS_RUNBOOK.md`](./OPERATIONS_RUNBOOK.md) — day-2 ops, incident response, Docker commands  
- [`CICD_STRATEGY.md`](./CICD_STRATEGY.md) — CI/CD target state, approvals, rollback risk  
- [`infra/README.md`](../README.md) — off-node deploy contract, `DOCKER_HOST`, stack order  
- [`scripts/infra/README.md`](../../scripts/infra/README.md) — `infra:preview` / `infra:up` details
