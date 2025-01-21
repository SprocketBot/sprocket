---
sidebar_position: 1
title: GraphQL API Overview
---

# GraphQL API

The Core service exposes its functionality through a GraphQL API. The schema is automatically generated using our resolvers via the `gen-sdl.ts` script, which creates the schema file at `clients/web/schema.graphql`.

## Schema Generation

The schema is generated using NestJS's GraphQL schema factory:

```typescript
// From gen-sdl.ts
const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
const schema = await gqlSchemaFactory.create(entityModules.flat());
```
