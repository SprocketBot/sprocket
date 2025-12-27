# Sprocket v2 Design Philosophy

## Core Principle: Simplicity

Sprocket v2 is a fundamental reimagining of the platform with one guiding principle: **simplicity**. Every architectural decision should be evaluated against this principle.

### What Simplicity Means

**Easy to Use**

- Intuitive user interfaces that require minimal training
- Clear, predictable workflows
- Consistent patterns across all features
- Helpful error messages and guidance

**Easy to Operate**

- Reduced infrastructure complexity
- Fewer moving parts to monitor and maintain
- Consolidated services where practical
- Clear operational procedures and runbooks

**Easy to Maintain**

- Clean, well-documented code
- Consistent patterns and conventions
- Comprehensive test coverage
- Minimal external dependencies

## Architectural Principles

### 1. Consolidation Over Distribution

**Philosophy**: Don't split services unless there's a compelling reason.

- **Postgres-first**: Use PostgreSQL as the primary data store for all services
- **Monolith-friendly**: Keep related functionality together unless performance/scaling demands separation
- **Shared database**: Multiple services can connect to the same database rather than using message queues for communication
- **Remove unnecessary infrastructure**: Redis, RabbitMQ, separate DBMSs are only justified if they solve a specific, measurable problem

**Example**: The v1 architecture used separate Redis, RabbitMQ, and DGraph instances. V2 consolidates these into PostgreSQL with TypeORM.

### 2. Convention Over Configuration

**Philosophy**: Sensible defaults with escape hatches when needed.

- Use standard patterns (NestJS conventions, TypeORM patterns)
- Minimal environment configuration
- Self-documenting code through clear naming and structure
- Configuration should be explicit and discoverable

### 3. Data Integrity First

**Philosophy**: Let the database do what it does best.

- Use PostgreSQL constraints, foreign keys, and checks
- Rely on ACID properties rather than eventual consistency
- Define schemas explicitly with TypeORM migrations
- Prefer database-level validation alongside application-level validation

### 4. Developer Experience Matters

**Philosophy**: Optimize for the next developer (who might be you).

- Clear README and setup instructions
- Docker Compose for local development
- Comprehensive test coverage (aim for >80%)
- Automated linting and formatting
- Well-structured documentation

### 5. Build for Today, Design for Tomorrow

**Philosophy**: Solve current problems, but don't paint yourself into a corner.

- Current scale: ~5k users, ~200 concurrent → design for 10x, not 1000x
- Use proven technologies over cutting-edge
- Extensibility points for known future needs (multi-game support)
- Refactor when complexity is justified by actual usage, not hypothetical scale

## Decision Framework

When evaluating technical decisions, ask:

1. **Does this reduce complexity?** If not, what complexity does it remove elsewhere?
2. **Is this solving a real problem?** Or are we over-engineering for hypothetical scale?
3. **Will the next developer understand this?** Can they modify it without extensive context?
4. **Can we test this easily?** Complex solutions are often hard to test.
5. **What's the operational burden?** More services = more to monitor, deploy, debug.

## Anti-Patterns to Avoid

- **Premature optimization**: Don't add caching, sharding, or distributed systems until measurements prove you need them
- **Resume-driven development**: Don't use a technology because it's trendy
- **Microservice sprawl**: Don't create a new service for every feature
- **Over-abstraction**: Don't create frameworks within frameworks
- **Configuration explosion**: Don't make everything configurable; pick good defaults

## Migration Strategy

The unified microservices migration (see [unified-monolith-migration.md](./unified-monolith-migration.md)) exemplifies this philosophy:

- **Remove complexity**: Eliminate Redis and RabbitMQ through service consolidation
- **Consolidate**: Integrate Matchmaking and Submissions into Core service, use PostgreSQL for all persistence and queueing
- **Simplify operations**: Fewer services to monitor and maintain
- **Improve reliability**: ACID guarantees and referential integrity

## Success Metrics

We know we're succeeding when:

- New contributors can set up the project in <30 minutes
- Features can be added without touching 10+ files
- Bugs are caught by tests, not production users
- Deployments are boring and predictable
- The team spends more time on features than infrastructure

## Feature Delivery Standards

To maintain velocity while ensuring quality, every feature must meet these standards before being considered "done":

### 1. Verification Strategy

We value confidence over coverage percentages, but high confidence usually requires code.

- **Check-in Requirement**: All PRs must pass the build and existing test suite.
- **Unit Tests**: Business logic execution paths must be covered by unit tests.
- **Integration Tests**: Features interacting with the database or external services must have integration tests running in the Docker Compose environment.
- **Validation**: Every feature must have a clear validation plan (e.g., "Deploy to staging, log in as user X, click Y").

### 2. Documentation as Code

Documentation is part of the feature, not an afterthought.

- **Feature Specs**: Design docs in `docs/docs` (or `docs/docs/implemented`) must be kept up-to-date with reality.
- **System Docs**: New systems (e.g., RBAC, API tokens) must have usage guides for other developers.
- **Runbooks**: Operational procedures for the feature must be documented if applicable.

## Exceptions and Trade-offs

This philosophy is a guide, not a straitjacket. There are legitimate reasons to add complexity:

- **Performance bottlenecks** backed by profiling data
- **Security requirements** that demand isolation
- **Compliance needs** that require specific architectures
- **Third-party integrations** that dictate certain patterns

When exceptions arise, document the decision and the data that justified it.

---

## Living Document

This philosophy should evolve as the project matures. Review it quarterly and update based on lessons learned. The goal is continuous simplification, not dogmatic adherence to rules written on day one.
