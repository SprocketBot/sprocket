**Issue #624 – Workspace consistency: `replay-parse-service`**

We decided **not** to add `microservices/replay-parse-service` to the root `package.json` workspaces list because the service is a **Python** microservice, not a Node workspace. Adding it would cause `npm run build --workspaces` to fail (missing `build` script, invalid package structure). The service is already correctly referenced in `docker-compose.yml` and has its own Dockerfile for building and running.

Therefore, the issue is considered **resolved** by documenting this rationale. If a future need arises to manage the Python service via npm (e.g., for dependency installation or testing), a dedicated wrapper or separate build script could be introduced, but for now we keep it as a standalone service.

---

*Closed.*