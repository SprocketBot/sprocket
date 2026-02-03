Task: Refactor the existing NestJS microservices into a single consolidated Monolith application to reduce V8 engine memory overhead.

Context: I have 7 NestJS services in this repository: one in core/, two in clients/, and four in microservices. Each has its own AppModule and main.ts. I want to create a new "Monolith" entry point that bootstraps all of them in a single process.

Execution Plan:

Codebase Analysis: Scan all subdirectories in the aforementioned folders. Identify the Root Module for each service (e.g., AuthModule, GatewayModule, etc.).

Shared Dependency Audit: Check for common modules like DatabaseModule, ConfigModule, or RedisModule. Note if they use .forRoot() with different configurations.

Create Monolith Module: > - Create a new directory apps/monolith/src.

Generate monolith.module.ts. This module must import all 7 identified Root Modules.

Conflict Resolution: If multiple modules use a global ConfigModule.forRoot(), refactor the MonolithModule to call ConfigModule.forRoot() once and ensure sub-modules use .forFeature() or simply inherit the global provider.

Generate Unified Entry Point:

Create apps/monolith/src/main.ts.

Use NestFactory.create(MonolithModule) to bootstrap the app.

Ensure any connectMicroservice calls found in individual main.ts files are merged into this new unified main.ts using app.connectMicroservice().

Consolidate all HTTP listeners to a single app.listen(3000).

Workspace Update: Update nest-cli.json and package.json to include the new monolith project and a start:monolith script.

Constraint:
  - Do NOT move the source code of the individual services. Keep them in their existing directories; only the imports in MonolithModule should reference them.
  - Make sure that your output *actually builds and runs* via the aforementioned script.

Output: Provide the file content for monolith.module.ts, main.ts, and the necessary modifications to nest-cli.json.

