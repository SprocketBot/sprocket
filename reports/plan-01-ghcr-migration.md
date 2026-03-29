# Plan 01: GHCR Migration

**Status**: Not started
**Prerequisite for**: All other CD plans (pipeline assumes images are on GHCR)
**Sprocket repo**: Infrastructure code now lives inside the main `sprocket` repository

## Manual Steps

These require credentials, console access, or decisions that cannot be automated.

### M1 — Create GHCR credentials
- Create a GitHub fine-grained PAT with `read:packages` and `write:packages` scopes
- Scope it to the MLE org (not personal account) if the packages will live under the org namespace
- Store it in whatever secrets vault is in use (1Password, etc.)

### M2 — Add secrets to GitHub repository
In the main `sprocket` repo settings (and any other repos that still build Sprocket images, if applicable):
- Add `GHCR_TOKEN` = the PAT from M1
- Confirm `GITHUB_TOKEN` has `packages: write` in the workflow permissions (set at org level or per-repo)

### M3 — Decide the GHCR namespace
Decide whether images live under a personal namespace (`ghcr.io/username/`) or org namespace (`ghcr.io/mle-org/`). This affects all image references. Document the decision — it cannot be changed without updating all references again.

### M4 — Set GHCR package visibility
After the first push, each package defaults to private. In the GitHub UI, set visibility to match your access requirements (private for prod images, internal for org-wide access).

### M5 — Validate connectivity from the prod node
SSH into the prod Droplet and confirm it can pull from GHCR:
```sh
echo "$GHCR_TOKEN" | docker login ghcr.io -u <github-user> --password-stdin
docker pull ghcr.io/<org>/<any-test-image>:<tag>
```
This must pass before any automated deployment references GHCR images.

---

## Agent Steps

These can be executed by an agent working in the infrastructure code inside the main `sprocket` repository.

### A1 — Audit all current image references
Search the repo for all `docker.io`, `docker.pkg.github.com`, and bare image references in:
- Pulumi programs (`*.ts`, `*.py`)
- GitHub Actions workflow files (`.github/workflows/*.yml`)
- `docker-compose` or Swarm stack files (`docker-compose*.yml`, `stack*.yml`)
- Any deploy scripts

Produce a list of every image reference and its current registry host.

### A2 — Update GitHub Actions build-and-push workflows
For each workflow that builds and pushes an image, replace the login/push steps:

**Before:**
```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

**After:**
```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

Update the image tag in the build step from `docker.io/<org>/<service>:<tag>` to `ghcr.io/<org>/<service>:<tag>`.

### A3 — Update Pulumi image references
In each Pulumi program, update the image string passed to Docker service/container resources from `docker.io/<org>/<service>:<tag>` to `ghcr.io/<org>/<service>:<tag>`.

If image tags are stored in Pulumi stack config (preferred), update the config values rather than the code. The code should reference `pulumi.Config` lookups, not hardcoded strings.

### A4 — Add GHCR login to Pulumi deployment scripts / Automation API entrypoints
If the Pulumi Automation API runner or any deploy script calls `docker pull` directly, prepend a GHCR login step using the `GHCR_TOKEN` environment variable.

### A5 — Add a `.dockerignore` audit
While touching the build pipeline, verify each service has a proper `.dockerignore` to prevent accidentally shipping `node_modules`, `.env`, or dev secrets into the image layer.

---

## Validation Checklist

- [ ] `docker push ghcr.io/<org>/<service>:<sha>` succeeds from GitHub Actions (check Actions log)
- [ ] `docker pull ghcr.io/<org>/<service>:<sha>` succeeds from prod node (check M5)
- [ ] `docker service update --image ghcr.io/<org>/<service>:<sha> <service>` succeeds on prod Swarm
- [ ] No `401 Unauthorized` or `429 Too Many Requests` in `docker service logs` after redeploy
- [ ] Zero remaining `docker.io` references in workflows, Pulumi code, and stack configs

## Tags

#project #sprocket #cd #ghcr #docker
