# Sprocket v2 Roadmap

## Vision

Sprocket v2 aims to be a simplified, maintainable platform for managing competitive gaming leagues across multiple games. This roadmap outlines the major features and migrations needed to achieve that vision.

## Guiding Principles

See [design-philosophy.md](./design-philosophy.md) for our core principles. TL;DR: **Simplicity in use, operation, and maintenance.**

---

## Major Feature Areas

### 1. V1 Microservices Migration (In Progress)
**Status**: Active development
**Priority**: P0 (Foundation for all other work)

Migrate v1 microservices into the v2 architecture using a unified approach that consolidates Matchmaking and Submissions into Core while maintaining Notifications, Image Generation, and Replay Parse as separate services with PostgreSQL event queues.

**Services to Migrate**:
- **Consolidated into Core**: Matchmaking, Submissions
- **Remaining Microservices**: Notifications, Image Generation, Replay Parse

**Key Deliverables**:
- Unified Core service with integrated matchmaking and submissions
- PostgreSQL-based event system for remaining microservices
- Elimination of Redis and RabbitMQ dependencies
- Simplified deployment and operational overhead

**Unified Migration Approach**:
- [Detailed Plan](./unified-monolith-migration.md)
- [Original Context](./archive/Postgres-only-migration.md)

**Dependencies**: None (this is the foundation)
**Risks**: Complex integration requiring careful testing of core workflows

**Questions for Discussion**:
1. Should we start with consolidating matchmaking or submissions first?
2. How do we ensure zero-downtime migration of active queues?
3. What's the current state of each service? Are they actively used in v1?

---

### 2. Multi-Game Data Model Refactor
**Status**: Planning
**Priority**: P1 (Critical for expansion)

Refactor the current Rocket League-centric data model to support multiple game types, starting with Trackmania.

**Key Areas**:
- Match/Round structure abstraction
- Player and team statistics generalization
- Game-specific metadata handling
- Backward compatibility with existing Rocket League data

**Dependencies**: Microservices migration should be substantially complete
**Risks**: Significant schema changes; need migration strategy for existing data

**Questions for Discussion**:
1. Should we maintain backward compatibility with v1 data, or is this a clean break?
2. What are the core differences between Rocket League and Trackmania match structures?
3. Are there other games on the roadmap we should consider now to avoid another refactor?
4. How do we handle game-specific statistics (e.g., goals/assists in RL vs. checkpoint times in Trackmania)?

---

### 3. Infrastructure Simplification (Completed via Migration)
**Status**: Completed as part of microservices migration
**Priority**: P0 (Achieved through unified approach)

Redis and RabbitMQ dependencies are eliminated through the unified microservices migration approach, resulting in a PostgreSQL-only architecture.

**Key Deliverables** (achieved via unified migration):
- ✅ Remove Redis dependency (via Core consolidation)
- ✅ Remove RabbitMQ dependency (via PostgreSQL event queues)
- ✅ Consolidate all data storage in PostgreSQL
- ✅ Simplify deployment and operational overhead

**Implementation**: See [Unified Migration Plan](./unified-monolith-migration.md)

---

### 4. Multi-Game ELO System
**Status**: Planning
**Priority**: P2 (Important but not blocking)

Design and implement a flexible ELO rating system that supports different formulae for different games.

**Current State**: v1 uses a separate DGraph microservice
**Proposed State**: Consolidate into PostgreSQL with configurable formulae

**Key Deliverables**:
- ELO calculation engine supporting multiple formulae
- Configuration system for per-game rating parameters
- Migration of existing ELO data from DGraph
- Historical rating tracking and adjustments

**Dependencies**: Multi-game data model
**Risks**: ELO calculations can be complex; need to ensure correctness

**Questions for Discussion**:
1. What are the specific ELO formula differences between games?
2. Do we need to support custom/pluggable formulae, or can we pre-define a set?
3. Should ELO be calculated synchronously (during match submission) or asynchronously?
4. How do we handle rating adjustments/resets for new seasons?

---

### 5. RBAC System Enhancement
**Status**: Planning
**Priority**: P2 (Security and usability)

Build out the Role-Based Access Control system with an administrative UI.

**Current State**: Casbin-based RBAC with partial implementation (see [authz-noodles.md](./authz-noodles.md))

**Key Deliverables**:
- Admin UI for role management (create, edit, delete roles)
- Admin UI for permission assignment (roles → permissions)
- Admin UI for user/group role assignment
- Comprehensive policy examples for common scenarios
- Documentation for policy creation and troubleshooting

**Dependencies**: None (can be developed in parallel)
**Risks**: RBAC complexity can spiral; need clear scope

**Questions for Discussion**:
1. Should we support group-based role assignment, or just individual users?
2. What's the minimal set of roles/permissions needed for MVP?
3. Do we need audit logging for permission changes?
4. Should policies be stored in database or configuration files?

---

### 6. API Token & Impersonation System
**Status**: Planning
**Priority**: P2 (Nice to have for power users)

Create a system for users to generate Personal Access Tokens (PATs) for third-party integrations.

**Key Deliverables**:
- User-facing UI to generate/revoke PATs
- Admin UI to view/revoke all tokens
- Token scoping (read-only, specific resources, etc.)
- Rate limiting per token
- Audit logging for token usage

**Dependencies**: RBAC system (tokens should respect user permissions)
**Risks**: Security implications of long-lived tokens

**Questions for Discussion**:
1. Should tokens have expiration dates (forced or optional)?
2. What scopes/permissions should be supported? (e.g., read-only, specific endpoints)
3. Do we need OAuth2 support, or are simple bearer tokens sufficient?
4. Should we support webhook callbacks for automations?

---

### 7. League Management UI
**Status**: Planning
**Priority**: P1 (Core functionality)

Build comprehensive UI for managing leagues, franchises, clubs, teams, and rosters.

**Key Features**:
- League creation and configuration
- Franchise/club/team hierarchy management
- Roster management (add/remove players, transfer players)
- Season management
- Role assignments (team captains, franchise managers, etc.)

**Dependencies**: RBAC system (permissions for who can manage what)
**Risks**: Complex UI with many interrelated entities

**Questions for Discussion**:
1. What's the entity hierarchy? (League → Franchise → Club → Team → Player?)
2. Can entities exist independently, or must they always be in hierarchy?
3. How do roster limits work? (Per team? Per franchise? Per skill level?)
4. What roster actions need approval workflows vs. immediate?
5. How do we handle player transfers between teams/franchises?

---

## Roadmap Phases

### Phase 1: Foundation (Microservices Migration)
**Goal**: Unified architecture with consolidated Core service and PostgreSQL-only infrastructure

- Consolidate Matchmaking into Core service
- Consolidate Submissions into Core service
- Implement PostgreSQL event system for remaining services
- Migrate Notifications service to PostgreSQL events
- Remove Redis and RabbitMQ infrastructure
- Begin multi-game data model design

### Phase 2: Core Features
**Goal**: Multi-game support and data model modernization

- Complete multi-game data model refactor
- Implement multi-game ELO system
- Migrate Image Generation service to PostgreSQL events
- Migrate Replay Parse service to PostgreSQL events
- Build league management backend services

### Phase 3: User-Facing Features
**Goal**: Admin and user tooling

- Complete RBAC system with admin UI
- Build league management UI (Phase 1: hierarchy and basic roster management)
- Implement API token system
- Create comprehensive admin interfaces

### Phase 4: Polish & Optimization
**Goal**: Production-ready platform

- League management UI (Phase 2: advanced features)
- Performance optimization and monitoring
- Complete documentation and runbooks
- Security audit and hardening
- Load testing and scalability validation

---

## Open Questions & Decisions Needed

### Cross-Cutting Concerns

1. **Testing Strategy**: What's our target coverage? Unit vs. integration vs. e2e?
2. **Deployment Strategy**: How do we roll out changes? Blue/green? Feature flags?
3. **Database Migrations**: How do we handle schema changes in production?
4. **Monitoring & Observability**: What metrics/logs do we need to track?
5. **Error Handling**: What's our error handling and reporting strategy?

### Technical Decisions

1. **API Design**: REST? GraphQL? Both?
2. **Frontend Framework**: What are we using for admin UIs?
3. **Authentication**: Current state? SSO? Multi-factor?
4. **File Storage**: Where do replays, images, etc. live?

---

## Success Metrics

We'll know we're on track when:

- **Developer velocity**: Features take less time to implement than v1
- **Operational overhead**: Fewer incidents, faster mean-time-to-recovery
- **User satisfaction**: Positive feedback on new UIs and features
- **Test coverage**: >80% coverage with high-value tests
- **Documentation**: Every feature has clear docs and examples

---

## Next Steps

1. Review and approve this roadmap
2. Create detailed feature specs for each major area (separate documents)
3. Break feature specs into granular tickets/issues
4. Prioritize and assign tickets for Phase 1
5. Establish sprint cadence and review process

---

## Living Document

This roadmap should be reviewed regularly and updated based on progress, blockers, and changing priorities. If scope creep or timeline issues arise, we re-evaluate against our core principle: **simplicity**.
