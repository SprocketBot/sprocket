# Cloud Agent Starter Skill (Run + Test)

Use this as the default quick-start when you are a Cloud agent working in `sprocket`.

Goal: get from clone to meaningful validation quickly, without guessing hidden setup.

## 0) First 5 minutes (always do this)

1. Confirm lane and repo root:
   - `git branch --show-current`
   - `pwd`
2. Confirm tool auth/state you may need:
   - `gh auth status` (read-only checks for GitHub CLI auth)
3. Confirm local env file exists (or let wrappers create it):
   - `test -f .env || test -f .env.local`
4. Use canonical local wrappers from repo root:
   - `npm run dev:up`
   - `npm run dev:status`
   - `npm run dev:logs -- core`

The `dev:up` wrapper will create `.env` from `.env.local` when needed.

## Login and auth patterns (practical defaults)

### Local web login

- Local web typically routes through Discord/Google OAuth.
- If `.env.local` still has placeholder OAuth values, browser sign-in is expected to fail.
- For backend validation, prefer direct GraphQL/harness checks instead of waiting on OAuth setup:
  - `curl http://localhost:3001/graphql -H 'Content-Type: application/json' -d '{"query":"{__typename}"}'`

### Hosted lane auth for Tier 1 checks

1. Copy profile template and keep secrets out of git:
   - `cp scripts/harness/env/main-prod-tier1.template.env /tmp/main-prod-tier1.env`
2. Fill auth values in the copied file. Preferred mode:
   - `HARNESS_ADMIN_REFRESH_TOKEN`
   - `HARNESS_LOGIN_AS_USER_ID`
3. Run scenario checks:
   - `npm run verify:tier1 -- main-prod /tmp/main-prod-tier1.env league`
   - `npm run verify:tier1 -- main-prod /tmp/main-prod-tier1.env scrim`
   - `npm run verify:tier1 -- main-prod /tmp/main-prod-tier1.env submission`

## Feature flags and safe mocking knobs

Use these knobs first before invasive local edits:

- `.env` / `.env.local`:
  - `ENABLE_TEST_MODE=true`
  - `GQL_PLAYGROUND=true`
  - `CLIENT_CHATWOOT_ENABLED=false`
- Tier 1 mutation safety gate:
  - `HARNESS_MUTATION_CONFIRM=YES` is required for mutating Tier 1 flows.
- Replay pipeline mock completion:
  - `HARNESS_USE_MOCK_COMPLETION=true` (requires admin auth env vars)
  - Use for workflow validation when full parser realism is not required.

Never commit secret-bearing `.env` or Tier 1 profile files.

## Codebase-area workflows

Each area below includes a concrete "edit -> run -> verify" loop.

### A) `core/` + `common/` (GraphQL/API behavior)

1. Start stack and tail core logs:
   - `npm run dev:up`
   - `npm run dev:logs -- core`
2. Validate API responds:
   - `curl http://localhost:3001/graphql -H 'Content-Type: application/json' -d '{"query":"{__typename}"}'`
3. Run targeted checks after edits:
   - `npm run lint --workspace=core`
   - `npm run test --workspace=core -- --runInBand`

### B) `clients/web/` (main web app)

1. Confirm app and API are up:
   - `npm run dev:status`
2. Validate shell + lane smoke:
   - open `http://localhost:8080`
   - `npm run dev:smoke`
   - `npm run verify:tier0 -- local-dev`
3. Run client-level checks for changed UI logic:
   - `npm run check --workspace=clients/web`
   - `npm run lint --workspace=clients/web`

### C) `clients/image-generation-frontend/`

1. Confirm frontend is reachable:
   - open `http://localhost:8081`
2. Validate compile/type/lint path:
   - `npm run check --workspace=clients/image-generation-frontend`
   - `npm run lint --workspace=clients/image-generation-frontend`

### D) `clients/discord-bot/`

1. Runtime depends on valid Discord credentials in `.env`.
2. If credentials are unavailable, still run high-signal local checks:
   - `npm run lint --workspace=clients/discord-bot`
   - `npm run test --workspace=clients/discord-bot -- --runInBand`
3. With valid credentials, monitor startup behavior:
   - `npm run dev:logs -- discord-bot`

### E) `microservices/*`

1. Bring up stack and inspect service health:
   - `npm run dev:up`
   - `npm run dev:status`
2. Run per-service checks (use only services you touched):
   - `npm run lint --workspace=microservices/matchmaking-service`
   - `npm run test --workspace=microservices/matchmaking-service -- --runInBand`
   - `npm run lint --workspace=microservices/submission-service`
   - `npm run lint --workspace=microservices/notification-service`
3. Validate integration surface with harness smoke:
   - `npm run verify:tier0 -- local-dev`

### F) `scripts/harness/` + `environments/` (verification contract)

1. Local lane baseline:
   - `npm run verify:tier0 -- local-dev`
2. Hosted lane baseline:
   - `npm run verify:tier0 -- main-prod`
3. Hosted Tier 1 targeted scenarios:
   - `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env league`
   - `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env scrim`
   - `npm run verify:tier1 -- main-prod /absolute/path/to/profile.env submission`
4. Artifacts land under:
   - `artifacts/release-validation/<environment>/<run-id>/`

### G) `infra/` (non-destructive defaults)

1. Install infra workspace deps if needed:
   - `npm run infra:install`
2. Run non-destructive backend verification:
   - `npm run infra:backend:verify`
3. Only run preview/up with explicit task scope and lane context:
   - `npm run infra:preview`
   - `npm run infra:up`

## Quick troubleshooting shortcuts

- Stack not healthy:
  - `npm run dev:status`
  - `npm run dev:logs -- core`
- Need a full local reset:
  - `npm run dev:reset`
- Local smoke failed and you changed harness/env contract:
  - rerun `npm run verify:tier0 -- local-dev` after confirming `.env` and lane profile.

## How to update this skill when new runbook knowledge appears

Keep this file lightweight and practical.

When you discover a new testing trick or recurring failure fix:

1. Add/update the relevant codebase-area section with:
   - trigger/symptom,
   - exact command(s),
   - expected pass signal.
2. Validate the new command once in the same branch.
3. If lane expectations changed, also update:
   - `scripts/harness/service-manifest.json`,
   - related `environments/*.json`,
   - `reports/agent-harness-progress.md`.
4. Prefer additive edits over broad rewrites.
