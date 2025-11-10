# Archived Documentation

This directory contains superseded documentation files that have been replaced by newer, more comprehensive plans.

## Archived Files

- [`Postgres-only-migration.md`](./Postgres-only-migration.md) - Original Redis/RabbitMQ removal plan
- [`detailed-migration-plan.md`](./detailed-migration-plan.md) - Detailed migration plan superseded by unified approach  
- [`feature-v1-microservices-migration.md`](./feature-v1-microservices-migration.md) - V1 microservices migration spec

## Why These Were Archived

These documents were superseded by the [Unified Migration to Monolith + PostgreSQL-Only Architecture](../unified-monolith-migration.md), which provides a more efficient approach by:
- Integrating Matchmaking and Submissions directly into Core
- Eliminating Redis dependencies entirely
- Simplifying the overall architecture

## Historical Context

These files are retained for reference to understand the evolution of the migration strategy, but should not be used for current implementation work.

**Last Updated**: 2025-11-10