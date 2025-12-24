---
sidebar_position: 1
title: Core Overview
---

# Sprocket Core

Sprocket Core is the central component of the Sprocket platform, serving as the primary orchestrator and data manager. It handles several key responsibilities:

- Manages all interactions with the primary PostgreSQL database
  - A secondary database, the EloDB, is maintained separately by its dedicated service
- Exposes the Sprocket API, built on GraphQL
- Orchestrates major processes within the platform through database operations and service coordination via internal REST APIs

## PostgreSQL Database + TypeORM

Sprocket's primary datastore is an instance of [PostgreSQL](https://www.postgresql.org/), a leading open-source relational database management system. We deliberately chose to keep our data in a relational structure to leverage the benefits of schema enforcement, data validation, and SQL's powerful querying capabilities.

To streamline database operations and reduce boilerplate code, we utilize [TypeORM](https://typeorm.io/), a powerful ORM that provides excellent TypeScript integration. Given Sprocket's current scale of deployments, TypeORM's abstraction layer has provided significant developer productivity benefits without introducing any notable performance bottlenecks that would necessitate hand-written SQL queries.

## GraphQL (External) API

Sprocket manages a wide array of data about its playerbase and organizations, including match results, player statistics, scrim outcomes, team rosters, and more. To provide controlled and validated access to this data, we expose a [GraphQL](https://graphql.org/)-based API. This architectural choice was driven by developer experience and efficiency considerations:

- GraphQL's schema-first approach ensures clear contract definition between server and clients
- The resolver pattern allows us to define data access patterns once per object type rather than per endpoint
- Clients can request exactly the data they need, reducing over-fetching
- Built-in introspection provides excellent tooling and documentation

You can find detailed documentation of our GraphQL API [here](./graphql-api.md).

## REST (Internal) API

The internal REST API is built using [Nest.js](https://nestjs.com/), a progressive Node.js framework that provides excellent TypeScript support and a robust architectural foundation. The API serves as the communication layer between Core and other Sprocket services.

Key aspects of our REST implementation include:

- Controllers decorated with `@Controller()` handle incoming HTTP requests
- Request validation through Nest's built-in pipes and custom validators
- Request/Response DTO interfaces ensure type safety across service boundaries
- Authentication and authorization through `@UseGuards()` decorators
- Service-to-service communication using Nest's `ClientProxy` for microservice patterns

The internal API is strictly isolated from external access and is only available to authenticated Sprocket services within our infrastructure. This separation allows us to maintain a clear boundary between public and private interfaces while leveraging Nest.js's powerful features for both.
