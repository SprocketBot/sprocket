# Sprocket v2 Roadmap

## Vision

Sprocket v2 aims to be a simplified, maintainable platform for managing competitive gaming leagues across multiple games. This roadmap outlines the major features and migrations needed to achieve that vision.

## Guiding Principles

See [design-philosophy.md](./design-philosophy.md) for our core principles. TL;DR: **Simplicity in use, operation, and maintenance.**

---

## Major Feature Areas

### 1. Infrastructure Simplification (In Progress)
**Status**: Active development
**Priority**: P0 (Blocker for other work)

Migrate away from Redis and RabbitMQ to a PostgreSQL-only architecture.

- [Detailed Plan](./detailed-migration-plan.md)
- [Original Context](./Postgres-only-migration.md)

**Key Deliverables**:
- Remove Redis dependency
- Remove RabbitMQ dependency
- Consolidate all data storage in PostgreSQL
- Simplify deployment and operational overhead

**Dependencies**: None
**Risks**: Requires careful migration of matchmaking and event-driven services

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

**Dependencies**: Infrastructure simplification should be complete first
**Risks**: Significant schema changes; need migration strategy for existing data

**Questions for Discussion**:
1. Should we maintain backward compatibility with v1 data, or is this a clean break?
2. What are the core differences between Rocket League and Trackmania match structures?
3. Are there other games on the roadmap we should consider now to avoid another refactor?
4. How do we handle game-specific statistics (e.g., goals/assists in RL vs. checkpoint times in Trackmania)?

---

### 3. V1 Microservices Migration
**Status**: Planning
**Priority**: P1 (Critical functionality)

Migrate v1 microservices into the v2 architecture and Docker Compose network.

**Services to Migrate**:
- Matchmaking
- Submissions
- Notifications
- Image Generation
- Replay Parse

**Key Considerations**:
- Should these remain separate services or consolidate into core?
- What dependencies do they have on Redis/RabbitMQ?
- How do they integrate with v2's data model?

**Dependencies**: Infrastructure simplification; potentially multi-game data model
**Risks**: Each service likely needs deep analysis; may uncover hidden dependencies

**Questions for Discussion**:
1. Which service should we tackle first? (Recommendation: Start with the simplest/least-coupled)
2. Do all of these need to remain microservices, or can some be consolidated?
3. What's the current state of each service? Are they actively used in v1?

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

### Phase 1: Foundation
**Goal**: Stable, simplified infrastructure

- Complete Redis migration
- Complete RabbitMQ migration
- Start multi-game data model design
- Begin RBAC system planning

### Phase 2: Core Features
**Goal**: Multi-game support and critical v1 migrations

- Complete multi-game data model refactor
- Migrate matchmaking service
- Migrate submissions service
- Implement multi-game ELO system

### Phase 3: User-Facing Features
**Goal**: Admin and user tooling

- Complete RBAC admin UI
- Migrate notifications service
- Build league management UI (Phase 1: hierarchy and basic roster management)
- Implement API token system

### Phase 4: Polish & Remaining Migrations
**Goal**: Feature complete

- Migrate image generation service
- Migrate replay parse service
- League management UI (Phase 2: advanced features)
- Documentation and runbooks
- Performance optimization

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
