# GHCR Image Audit

Updated: March 17, 2026
Branch: `codex/ghcr-migration-a1-a5`

## Scope

Audited image references in:
- Pulumi programs (`infra/**/*.ts`)
- GitHub Actions workflows and reusable build action
- `docker-compose*.yml`
- deploy and verification scripts

No non-doc deploy script or Pulumi Automation API entrypoint in this repo currently performs `docker pull`.

## Image References

| Path | Reference | Registry Host |
| --- | --- | --- |
| `.github/workflows/on-changes.yml` | `ghcr.io/${{ github.repository_owner }}/monorepo-core:${{ steps.extract_branch.outputs.branch }}` | `ghcr.io` |
| `.github/reusable_workflows/build_container/action.yaml` | `ghcr.io/${{ github.repository_owner }}/monorepo-core:${{ inputs.docker_tag }}` | `ghcr.io` |
| `.github/reusable_workflows/build_container/action.yaml` | `ghcr.io/${{ github.repository_owner }}/${{ inputs.docker_image }}:${{ inputs.docker_tag }}` | `ghcr.io` |
| `docker-compose.yml` | `rabbitmq:3.10-management-alpine` | `docker.io` (implicit `library/rabbitmq`) |
| `docker-compose.yml` | `minio/minio:latest` | `docker.io` |
| `docker-compose.yml` | `redis:7-alpine` | `docker.io` (implicit `library/redis`) |
| `docker-compose.yml` | `postgres:14-alpine` | `docker.io` (implicit `library/postgres`) |
| `infra/global/services/traefik/DiscordForwardAuth.ts` | `ghcr.io/<image-namespace>/discord-forward-auth:latest` via `getImageSha(...)` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/<monolith-image-repository>:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/core:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/web:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/image-generation-frontend:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/discord-bot:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/notification-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/image-generation-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/server-analytics-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/matchmaking-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/replay-parse-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/elo-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/Platform.ts` | `ghcr.io/<image-namespace>/submission-service:<image-tag>` | `ghcr.io` |
| `infra/platform/src/legacy/LegacyPlatform.ts` | `ghcr.io/<image-namespace>/worker:master` via `getImageSha(...)` | `ghcr.io` |
| `infra/platform/src/legacy/LegacyPlatform.ts` | `ghcr.io/<image-namespace>/bot:master` via `getImageSha(...)` | `ghcr.io` |
| `infra/global/services/traefik/SocketProxy.ts` | `tecnativa/docker-socket-proxy:latest` | `docker.io` |
| `infra/global/services/traefik/Traefik.ts` | `traefik:v2.11` | `docker.io` (implicit `library/traefik`) |
| `infra/global/services/gatus/Gatus.ts` | `twinproduction/gatus:v5.1.0` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/init:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/db:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/worker:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/bootloader:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/cron:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/temporal:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/webapp:0.40.4` | `docker.io` |
| `infra/global/services/airbyte/Airbyte.ts` | `airbyte/server:0.40.4` | `docker.io` |
| `infra/global/services/n8n/N8n.ts` | `n8nio/n8n` | `docker.io` |
| `infra/global/services/minio/Minio.ts` | `minio/minio:RELEASE.2022-04-30T22-23-53Z` | `docker.io` |
| `infra/global/services/dgraph/DGraph.ts` | `dgraph/dgraph:v21.12.0` | `docker.io` |
| `infra/global/services/rabbitmq/RabbitMq.ts` | `rabbitmq:3.9.14-management-alpine` | `docker.io` (implicit `library/rabbitmq`) |
| `infra/global/services/grafana/Grafana.ts` | `grafana/grafana:main` | `docker.io` |
| `infra/global/services/redis/Redis.ts` | `redislabs/rejson:2.0.7` | `docker.io` |
| `infra/global/services/telegraf/Telegraf.ts` | `telegraf:1.22-alpine` | `docker.io` (implicit `library/telegraf`) |
| `infra/global/services/chatwoot/Chatwoot.ts` | `chatwoot/chatwoot:latest-ce` | `docker.io` |
| `infra/global/services/fluentd/FluentD.ts` | `fluentd:latest` | `docker.io` (implicit `library/fluentd`) |
| `infra/global/services/loki/Loki.ts` | `grafana/loki:main-1a7b170` | `docker.io` |
| `infra/global/services/neo4j/Neo4j.ts` | `neo4j:4.4.7-community` | `docker.io` (implicit `library/neo4j`) |
| `infra/global/services/influx/Influx.ts` | `influxdb:2.1-alpine` | `docker.io` (implicit `library/influxdb`) |

## Registry Auth Surfaces

| Path | Current Registry Host |
| --- | --- |
| `.github/workflows/on-changes.yml` | `ghcr.io` |
| `.github/reusable_workflows/build_container/action.yaml` | `ghcr.io` |
| `infra/global/providers/DockerProvider.ts` | `ghcr.io` |
| `infra/global/services/traefik/DiscordForwardAuth.ts` | `ghcr.io` |
| `infra/platform/src/microservices/SprocketService.ts` | `ghcr.io` |
| `infra/platform/src/legacy/LegacyPlatform.ts` | `ghcr.io` |
