# Sprocket v2 Documentation Index

This document serves as the central index for all Sprocket v2 planning and feature documentation.

## Quick Start

**New to the project?** Start here:
1. Read the [Design Philosophy](./design-philosophy.md) to understand our approach
2. Review the [Roadmap](./roadmap.md) for the big picture
3. Pick a feature area and dive into its spec

## Core Documents

### Vision & Philosophy

- **[Design Philosophy](./design-philosophy.md)** - Our guiding principles: simplicity, consolidation, and maintainability
- **[Roadmap](./roadmap.md)** - High-level overview of all major features and phases

### Current Work

- **[Unified Migration to Monolith + PostgreSQL-Only Architecture](./unified-monolith-migration.md)** - **ACTIVE** - Consolidated plan replacing both Redis/RabbitMQ removal and V1 microservices migration
- ~~[Postgres-only Migration](./archive/Postgres-only-migration.md)~~ - Superseded by unified migration (archived)
- ~~[Detailed Migration Plan](./archive/detailed-migration-plan.md)~~ - Superseded by unified migration (archived)

### Legacy Context

- **[RBAC Musings (authz-noodles.md)](./authz-noodles.md)** - Original thoughts on the authorization system

---

## Feature Specifications

Each feature spec includes:
- Overview and current/target state
- Data model design
- API endpoints
- Task breakdown
- Open questions and design decisions
- Success criteria
- Risks and mitigations

### 1. Multi-Game Data Model Refactor
**[feature-multi-game-data-model.md](./feature-multi-game-data-model.md)**

Refactor the Rocket League-centric data model to support multiple game types (Trackmania, future games).

**Key Topics**:
- Flexible Match/Round/Result structure
- Game-specific stat handling via JSONB
- Rocket League vs Trackmania match flows
- Zod validation per game

**Priority**: P1 (Critical for expansion)

---

### 2. V1 Microservices Migration
**[feature-v1-microservices-migration.md](./archive/feature-v1-microservices-migration.md)** *(DEPRECATED - see unified migration)*

~~Migrate five v1 microservices into v2 architecture, removing Redis/RabbitMQ dependencies.~~

**Services**:
1. Notifications (remain separate)
2. Image Generation (remain separate)
3. Replay Parse (remain separate)
4. ~~Submissions (integrate into core)~~
5. ~~Matchmaking (integrate into core)~~

**Key Topics**:
- ~~PostgreSQL event queue for service communication~~
- ~~Docker Compose integration~~
- ~~Service consolidation decisions~~

**Note**: This spec has been superseded by the [unified migration plan](./unified-monolith-migration.md) which provides a more efficient approach by integrating high-coupling services (Submissions, Matchmaking) into Core, eliminating their Redis dependencies entirely. This document is archived for historical reference.
**Priority**: P1 (Critical functionality - now handled by unified migration)

---

### 3. Multi-Game ELO System
**[feature-multi-game-elo.md](./feature-multi-game-elo.md)**

Graph-based ELO rating system supporting multiple games and formulae, with invalidation and recalculation.

**Key Topics**:
- Graph structure (rating nodes and match calculations)
- Match invalidation with dependent recalculation
- Graph compaction for performance
- Game-specific formulae (ELO, Glicko, TrueSkill)
- Migration from DGraph

**Priority**: P2 (Important but not blocking)

---

### 4. RBAC System Enhancement
**[feature-rbac-system.md](./feature-rbac-system.md)**

Comprehensive Role-Based Access Control using Casbin, with admin UI for managing roles and permissions.

**Key Topics**:
- Casbin policy model
- Role hierarchy (Player → Captain → GM → FM → League Ops → Admin)
- Scope-based permissions (own, own_team, own_club, own_franchise, all)
- Admin UI for role/permission management
- Approval workflows for sensitive roles

**Priority**: P2 (Security and usability)

---

### 5. API Token & Impersonation System
**[feature-api-tokens.md](./feature-api-tokens.md)**

Personal Access Token system for third-party integrations and user automations.

**Key Topics**:
- Token generation and secure storage (SHA256 hashing)
- Scope-based access control
- Rate limiting per token
- Admin token management
- Usage audit logging

**Priority**: P2 (Nice to have for power users)

---

### 6. League Management UI
**[feature-league-management.md](./feature-league-management.md)**

Comprehensive UI for managing organizational hierarchy and rosters.

**Key Topics**:
- Entity hierarchy: League → Franchise → Club → Team → Player
- Roster management with offer system
- Role assignments (Captain, GM, FM)
- Season management
- Approval workflows

**Priority**: P1 (Core functionality)

---

## Task Breakdown

**[tickets-breakdown.md](./tickets-breakdown.md)**

Comprehensive breakdown of all features into actionable tickets, organized by epic.

**Structure**:
- 7 Epics (one per major feature area)
- ~200+ individual tickets
- Priority labels (P0, P1, P2, P3)
- Effort estimates (Small, Medium, Large, XL)
- Acceptance criteria

**Use this document to**:
- Create GitHub issues
- Plan sprints
- Track progress
- Estimate workload

---

## How to Use This Documentation

### For Product Planning
1. Start with the [Roadmap](./roadmap.md)
2. Review each feature spec for scope and priorities
3. Use [tickets-breakdown.md](./tickets-breakdown.md) to create issues

### For Development
1. Pick a ticket from [tickets-breakdown.md](./tickets-breakdown.md)
2. Read the corresponding feature spec for context
3. Refer to [design-philosophy.md](./design-philosophy.md) when making decisions
4. Update the spec if you discover new requirements

### For Architecture Decisions
1. Review [design-philosophy.md](./design-philosophy.md)
2. Check if the decision aligns with simplicity principles
3. Document exceptions with justification
4. Update the relevant feature spec

---

## Documentation Standards

### When to Update These Docs

**Always update**:
- When scope changes for a feature
- When new technical decisions are made
- When open questions are resolved
- When risks are discovered or mitigated

**Don't update**:
- For every minor code change
- For implementation details (those belong in code comments or ADRs)

### How to Add New Features

1. Create a new `feature-{name}.md` file
2. Follow the structure of existing feature specs
3. Add to this index
4. Add tickets to `tickets-breakdown.md`
5. Update `roadmap.md` if it's a major feature

---

## Open Questions by Feature

Quick reference for unresolved design decisions:

### Multi-Game Data Model
- Should RoundResult point to team XOR player, or support both?
- How granular should stat validation be (JSON Schema vs separate tables)?
- Where should points calculation logic live (config vs service)?

### V1 Microservices Migration
- ~~Which microservices remain separate vs integrate into core?~~ *(Resolved: Submissions & Matchmaking integrate into Core)*
- ~~Event queue: pg_notify vs polling vs HTTP webhooks?~~ *(Resolved: Polling with PostgreSQL event queue)*

### Multi-Game ELO
- Recalculate all dependent matches on invalidation, or limit cascade?
- Real-time vs batch rating calculation?
- Single rating system per game, or support multiple simultaneously?

### RBAC System
- Group-based role assignment, or individual only?
- Policies in database or config files? (Decision: database)
- Permission caching strategy?

### API Tokens
- Default token expiration, or allow "never expires"?
- Scope granularity: coarse vs resource-level vs endpoint-level?
- Usage log retention period?

### League Management
- Player transfer workflow: separate actions vs atomic transfer?
- Franchise/club naming: auto-generate or allow custom?
- Historical roster tracking: full history or just current season?

---

## Related Resources

### External Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Casbin Documentation](https://casbin.org/docs/en/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Internal Resources
- API Documentation (to be created)
- Database ERD (to be created from schemas)
- Development Setup Guide (update `README.md`)

---

## Changelog

### 2025-10-14
- Initial creation of all feature specs
- Created design philosophy document
- Created comprehensive roadmap
- Generated ticket breakdown
- Created this index

---

## Contributing

When adding or updating documentation:

1. **Be clear**: Write for someone who doesn't have full context
2. **Be concise**: Respect the reader's time
3. **Be consistent**: Follow the structure of existing docs
4. **Be actionable**: Include concrete next steps, not just theory
5. **Be honest**: Document unknowns and risks, don't hide them

Remember: **These docs exist to reduce complexity, not add to it.** If a document feels too complex, simplify it.
