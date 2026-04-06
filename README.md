# Sprocket Project Repo

<div align="center">
  
  [![Discord Server](https://img.shields.io/discord/856290331279884288.svg?label=Discord&logo=Discord&colorB=7289da&style=for-the-badge)](https://discord.gg/hJ3YAvHucb)
  [![Support us on Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/sprocketbot)
  [![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/SprocketBot_)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/sprocketbot)
  
</div>

---

Sprocket is a platform primarily used to manage and automate organized Esports leagues, one such example being [Minor League Esports](https://mlesports.gg).
The platform uses a Microservice pattern, and this repository contains everything needed to quickly start a new microservice.

## Repository Layout

Application code lives under `clients/`, `microservices/`, `common/`, and `core/`.
Infrastructure code now lives under `infra/`, which contains the Pulumi projects migrated from the former `sprocket-infra` repository:

- `infra/global`
- `infra/layer_1`
- `infra/layer_2`
- `infra/platform`

The committed `Pulumi.*.yaml` files moved with the code so stack configuration remains in version control. Pulumi backend state is still remote and must be accessed with the same backend login (these projects use Pulumi Cloud as the backend).

## Agent Entry Point

For autonomous or agent-assisted work, start with:

- [`AGENTS.md`](./AGENTS.md)
- [`reports/agent-ops-index.md`](./reports/agent-ops-index.md)
- [`scripts/harness/service-manifest.json`](./scripts/harness/service-manifest.json)

These files define the current repo operating surface, canonical commands, and machine-readable service/lane metadata.

## Canonical Command Surface

For routine repo operation, prefer the root command layer:

```bash
npm run dev:up
npm run dev:status
npm run dev:logs -- core
npm run dev:smoke
npm run verify:tier0 -- local-dev
npm run verify:tier0 -- main-prod
npm run verify:tier1 -- main-prod /absolute/path/to/tier1.env league
npm run verify:all -- main-prod /absolute/path/to/tier1.env
```

These commands wrap the current docker-compose and harness workflows in a more stable agent-friendly surface.

For infrastructure deploy work, use the off-node command surface:

```bash
nvm use
npm run infra:install
npm run infra:backend:verify -- platform prod
npm run infra:preview -- platform prod
npm run infra:up -- platform prod --yes
```

The deployment runner contract is documented in [`scripts/infra/README.md`](./scripts/infra/README.md) and [`infra/README.md`](./infra/README.md).

Prod rollback (immutable image tags, Pulumi): [`infra/docs-output/ROLLBACK_PRODUCTION.md`](./infra/docs-output/ROLLBACK_PRODUCTION.md).

## Building / Running this Repository

### Installing Dependencies:

```bash
# In the root directory
npm i
```

### Building Projects

```bash
# In the root directory
npm run build --workspaces --if-present
```

### Running Projects

```bash
# In the project directory
npm run dev
# For the replay parse service
./start.sh
```

## Building Docker images

### Build the base image

```shell
docker build . -f dockerfiles/node.Dockerfile -t sprocket-base-image --build-arg COMMIT_SHA=$(git log -1 --format=%H)

docker image ls | grep sprocket
# ->
#    sprocket-base-image                                   latest             cfb627899675   5 seconds ago   1.01GB
```

### Build microservice image

For example, building `clients/web`:

```shell
docker build . -f clients/web/Dockerfile -t sprocket-web --build-arg BASE_IMAGE=sprocket-base-image

docker image ls | grep sprocket
# ->
#    sprocket-web                                          latest             6661a25ebce4   5 seconds ago    1.01GB
#    sprocket-base-image                                   latest             cfb627899675   30 seconds ago   1.01GB
```

## Inspecting `COMMIT_SHA` of Image / Container

```shell
docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' <image/container name or id> | grep COMMIT_SHA
```
