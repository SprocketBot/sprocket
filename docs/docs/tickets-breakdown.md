# Sprocket v2 - Issue/Ticket Breakdown

This document breaks down all feature specs into granular, actionable tickets. Each ticket is labeled with:
- **Priority**: P0 (critical), P1 (high), P2 (medium), P3 (low)
- **Type**: Feature, Bug, Refactor, Documentation
- **Estimate**: Small (< 1 day), Medium (1-3 days), Large (3-5 days), XL (> 5 days)

---

## Epic 1: V1 Microservices Migration (P0)

**Status**: In Progress (see [unified-monolith-migration.md](./unified-monolith-migration.md))

### Phase 1: Core Service Consolidation (Priority: P0)

#### Core Integration (Priority: P0)

##### MS-CORE-001: Integrate Matchmaking into Core service
- **Type**: Refactor
- **Estimate**: XL
- **Description**: Move matchmaking service into Core, replace Redis with PostgreSQL
- **Acceptance Criteria**:
  - [ ] Move matchmaking code to `core/src/matchmaking/`
  - [ ] Replace Redis queue with PostgreSQL `ScrimQueue` table
  - [ ] Replace Redis timeout logic with PostgreSQL `ScrimTimeout` table
  - [ ] Integrate with Core's existing TypeORM setup
  - [ ] Remove Redis dependencies

##### MS-CORE-002: Integrate Submissions into Core service
- **Type**: Refactor
- **Estimate**: XL
- **Description**: Move submissions service into Core, replace Redis with PostgreSQL
- **Acceptance Criteria**:
  - [ ] Move submissions code to `core/src/submissions/`
  - [ ] Replace Redis temporary storage with PostgreSQL `MatchSubmission` table
  - [ ] Integrate submission validation into Core's validation pipeline
  - [ ] Remove Redis dependencies

##### MS-CORE-003: Remove Redis infrastructure
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Clean up Redis from deployment and configuration
- **Acceptance Criteria**:
  - [ ] Remove Redis from `docker-compose.yaml`
  - [ ] Remove Redis from `nomad.job.hcl`
  - [ ] Remove Redis-related environment variables from `.env.example`
  - [ ] Delete `lib/src/redis/` module
  - [ ] Remove cache interceptor from Core

### Phase 2: PostgreSQL Event System (Priority: P0)

##### MS-EVENT-001: Create EventQueue table and entities
- **Type**: Feature
- **Estimate**: Small
- **Description**: PostgreSQL-based event system for remaining microservices
- **Acceptance Criteria**:
  - [ ] `EventQueue` entity with event type, payload, status fields
  - [ ] Migration script
  - [ ] Indexes for efficient polling

##### MS-EVENT-002: Implement event producers in Core
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Replace RabbitMQ publishing with PostgreSQL events
- **Acceptance Criteria**:
  - [ ] Event creation service in Core
  - [ ] Replace all RabbitMQ `broker.publish()` calls
  - [ ] Event schema validation

### Phase 3: Remaining Service Migrations (Priority: P1)

##### MS-SVC-001: Migrate Notifications service
- **Type**: Refactor
- **Estimate**: Large
- **Description**: Convert from RabbitMQ to PostgreSQL event queue
- **Acceptance Criteria**:
  - [ ] Replace RabbitMQ consumer with PostgreSQL polling
  - [ ] Create `Notification` entity for history tracking
  - [ ] Port Discord notification logic
  - [ ] Port email notification logic
  - [ ] Add retry and error handling

##### MS-SVC-002: Migrate Image Generation service
- **Type**: Refactor
- **Estimate**: Large
- **Description**: Convert from RabbitMQ to PostgreSQL event queue
- **Acceptance Criteria**:
  - [ ] Replace RabbitMQ consumer with PostgreSQL polling
  - [ ] Create `GeneratedImage` entity for tracking
  - [ ] Port image generation logic
  - [ ] Configure storage backend (S3/local)

##### MS-SVC-003: Migrate Replay Parse service
- **Type**: Refactor
- **Estimate**: Large
- **Description**: Convert from RabbitMQ to PostgreSQL event queue
- **Acceptance Criteria**:
  - [ ] Replace RabbitMQ consumer with PostgreSQL polling
  - [ ] Create `ReplayFile` entity for tracking
  - [ ] Port Rocket League replay parser
  - [ ] Implement file upload endpoint

### Phase 4: Final Cleanup (Priority: P1)

##### MS-CLEANUP-001: Remove RabbitMQ infrastructure
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Clean up RabbitMQ from deployment and configuration
- **Acceptance Criteria**:
  - [ ] Remove RabbitMQ from `docker-compose.yaml`
  - [ ] Remove RabbitMQ from `nomad.job.hcl`
  - [ ] Delete `lib/src/rmq/` module
  - [ ] Remove RabbitMQ-related environment variables
  - [ ] Delete broker files from migrated services

##### MS-CLEANUP-002: Update Docker Compose configuration
- **Type**: Refactor
- **Estimate**: Small
- **Description**: Add remaining services to Docker Compose
- **Acceptance Criteria**:
  - [ ] Add notifications service configuration
  - [ ] Add image generation service configuration
  - [ ] Add replay parse service configuration
  - [ ] Configure shared networks and volumes

### Testing & Validation (Priority: P1)

##### MS-TEST-001: Write integration tests for unified Core
- **Type**: Test
- **Estimate**: Large
- **Description**: Test consolidated matchmaking and submissions
- **Acceptance Criteria**:
  - [ ] End-to-end matchmaking flows
  - [ ] Submission validation and processing
  - [ ] Event publishing from Core

##### MS-TEST-002: Write integration tests for event system
- **Type**: Test
- **Estimate**: Medium
- **Description**: Test PostgreSQL event queue functionality
- **Acceptance Criteria**:
  - [ ] Event publishing from Core
  - [ ] Event consumption by services
  - [ ] Retry and error handling

---

## Epic 2: Multi-Game Data Model Refactor (P1)

**Related Spec**: [feature-multi-game-data-model.md](./feature-multi-game-data-model.md)

### Database Schema (Priority: P0)

#### MGDM-001: Create Game entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Create `Game` entity with name, slug, config fields
- **Acceptance Criteria**:
  - [ ] Entity created with TypeORM
  - [ ] Migration script generated
  - [ ] Seed data for Rocket League and Trackmania

#### MGDM-002: Create MatchType entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Create `MatchType` entity for regular season, playoffs, scrims, etc.
- **Acceptance Criteria**:
  - [ ] Entity created
  - [ ] Migration script
  - [ ] Seed data for common match types

#### MGDM-003: Refactor Match entity
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Add `game` FK to Match, add `gameSpecificMetadata` JSONB field
- **Acceptance Criteria**:
  - [ ] Migration updates Match table
  - [ ] Existing matches linked to Rocket League game
  - [ ] Schema enforces FK constraints

#### MGDM-004: Create Round entity
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Create `Round` entity with match FK, round number, map name
- **Acceptance Criteria**:
  - [ ] Entity created
  - [ ] Migration script
  - [ ] Unique constraint on (match_id, round_number)

#### MGDM-005: Create RoundResult entity
- **Type**: Feature
- **Estimate**: Large
- **Description**: Create flexible `RoundResult` entity supporting team-based and player-based results
- **Acceptance Criteria**:
  - [ ] Entity created with nullable team/player FKs
  - [ ] Score, placement, isWinner fields
  - [ ] JSONB stats field for game-specific stats

#### MGDM-006: Create MatchTeam entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Aggregate team results at match level
- **Acceptance Criteria**:
  - [ ] Entity created
  - [ ] Total score and isWinner fields

#### MGDM-007: Create MatchPlayer entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Aggregate player results at match level
- **Acceptance Criteria**:
  - [ ] Entity created
  - [ ] Aggregate stats JSONB field

#### MGDM-008: Add indexes for match queries
- **Type**: Refactor
- **Estimate**: Small
- **Description**: Add indexes on game_id, player_id, team_id for efficient queries
- **Acceptance Criteria**:
  - [ ] Index on match.game_id
  - [ ] Index on round_result.player_id
  - [ ] Index on round_result.team_id

### Game Configuration (Priority: P1)

#### MGDM-009: Define GameConfig interface
- **Type**: Feature
- **Estimate**: Small
- **Description**: TypeScript interface for game configuration
- **Acceptance Criteria**:
  - [ ] Interface includes scoringSystem, statDefinitions
  - [ ] Documented with examples

#### MGDM-010: Create Rocket League game config
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Define RL stat definitions (goals, assists, saves, etc.)
- **Acceptance Criteria**:
  - [ ] Config JSON/object created
  - [ ] Seeded into database
  - [ ] Includes winner-loser scoring system

#### MGDM-011: Create Trackmania game config
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Define Trackmania stat definitions (finish time, placement, etc.)
- **Acceptance Criteria**:
  - [ ] Config JSON/object created
  - [ ] Seeded into database
  - [ ] Includes placement-based scoring system

### Validation & Business Logic (Priority: P1)

#### MGDM-012: Create Zod schemas for RL stats
- **Type**: Feature
- **Estimate**: Small
- **Description**: Validate RL-specific stats (goals, assists, saves)
- **Acceptance Criteria**:
  - [ ] Zod schema defined
  - [ ] Unit tests for validation

#### MGDM-013: Create Zod schemas for Trackmania stats
- **Type**: Feature
- **Estimate**: Small
- **Description**: Validate Trackmania-specific stats (finish time, placement)
- **Acceptance Criteria**:
  - [ ] Zod schema defined
  - [ ] Unit tests for validation

#### MGDM-014: Implement game-agnostic match creation service
- **Type**: Feature
- **Estimate**: Large
- **Description**: Service to create matches for any game type
- **Acceptance Criteria**:
  - [ ] Accepts game parameter
  - [ ] Validates game config
  - [ ] Creates match with correct structure

#### MGDM-015: Implement stat validation middleware
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Validate stats before persisting to RoundResult
- **Acceptance Criteria**:
  - [ ] Middleware checks game type
  - [ ] Applies correct Zod schema
  - [ ] Returns clear error messages

#### MGDM-016: Implement scoring calculation logic
- **Type**: Feature
- **Estimate**: Large
- **Description**: Calculate points for placement-based games (Trackmania)
- **Acceptance Criteria**:
  - [ ] Configurable point mappings (1st = 10pts, etc.)
  - [ ] Sum points across rounds
  - [ ] Determine match winner

### API Endpoints (Priority: P1)

#### MGDM-017: Update POST /matches endpoint
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Accept game parameter, create game-aware match
- **Acceptance Criteria**:
  - [ ] Validates game exists
  - [ ] Creates match with game FK
  - [ ] API docs updated

#### MGDM-018: Update POST /matches/:id/rounds endpoint
- **Type**: Feature
- **Estimate**: Large
- **Description**: Submit round results for any game type
- **Acceptance Criteria**:
  - [ ] Accepts game-specific stats
  - [ ] Validates via Zod schema
  - [ ] Creates RoundResult entries

#### MGDM-019: Update GET /matches/:id endpoint
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Return game-aware match structure
- **Acceptance Criteria**:
  - [ ] Includes game info
  - [ ] Includes round results
  - [ ] Formats stats correctly per game

#### MGDM-020: Update GET /players/:id/stats endpoint
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Filter stats by game
- **Acceptance Criteria**:
  - [ ] Query parameter for game
  - [ ] Aggregates stats per game
  - [ ] Returns game-specific stat breakdown

#### MGDM-021: Add GET /games endpoint
- **Type**: Feature
- **Estimate**: Small
- **Description**: List all available games
- **Acceptance Criteria**:
  - [ ] Returns active games
  - [ ] Includes game config metadata

### Testing (Priority: P2)

#### MGDM-022: Unit tests for game config parsing
- **Type**: Test
- **Estimate**: Small

#### MGDM-023: Unit tests for stat validation
- **Type**: Test
- **Estimate**: Small

#### MGDM-024: Integration tests for RL match flow
- **Type**: Test
- **Estimate**: Medium

#### MGDM-025: Integration tests for Trackmania match flow
- **Type**: Test
- **Estimate**: Medium

#### MGDM-026: E2E tests for match creation and retrieval
- **Type**: Test
- **Estimate**: Medium

### Documentation (Priority: P2)

#### MGDM-027: Document new schema in ERD
- **Type**: Documentation
- **Estimate**: Small

#### MGDM-028: API documentation for game-specific endpoints
- **Type**: Documentation
- **Estimate**: Small

#### MGDM-029: Examples for each supported game type
- **Type**: Documentation
- **Estimate**: Small

---

## Epic 3: V1 Microservices Migration (P1)

**Related Spec**: [feature-v1-microservices-migration.md](./archive/feature-v1-microservices-migration.md)

### Service 1: Notifications (Priority: P1)

#### MS-001: Create Notification entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Entity for tracking notification history
- **Acceptance Criteria**:
  - [ ] Entity created with channel, status, payload fields
  - [ ] Migration script

#### MS-002: Implement PostgreSQL event queue for notifications
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Replace RabbitMQ with polling event queue
- **Acceptance Criteria**:
  - [ ] EventQueue table created
  - [ ] Polling worker implemented
  - [ ] Triggers notifications on events

#### MS-003: Port Discord notification logic
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Migrate Discord notification code
- **Acceptance Criteria**:
  - [ ] Sends Discord messages
  - [ ] Handles errors gracefully

#### MS-004: Port email notification logic
- **Type**: Refactor
- **Estimate**: Medium
- **Description**: Migrate email notification code
- **Acceptance Criteria**:
  - [ ] Sends emails via SMTP
  - [ ] Handles errors gracefully

#### MS-005: Add retry and error handling
- **Type**: Feature
- **Estimate**: Small
- **Description**: Retry failed notifications
- **Acceptance Criteria**:
  - [ ] Retries up to 3 times
  - [ ] Exponential backoff
  - [ ] Logs failures

#### MS-006: Update Docker Compose with notifications service
- **Type**: Refactor
- **Estimate**: Small
- **Description**: Add notifications service to docker-compose.yml
- **Acceptance Criteria**:
  - [ ] Service definition added
  - [ ] Env vars configured

#### MS-007: Write integration tests for notifications
- **Type**: Test
- **Estimate**: Medium

### Service 2: Image Generation (Priority: P1)

#### MS-008: Create GeneratedImage entity
- **Type**: Feature
- **Estimate**: Small

#### MS-009: Port image generation logic
- **Type**: Refactor
- **Estimate**: Large
- **Description**: Migrate Puppeteer/Canvas logic

#### MS-010: Implement event-driven trigger
- **Type**: Feature
- **Estimate**: Medium

#### MS-011: Configure storage backend
- **Type**: Feature
- **Estimate**: Medium
- **Description**: S3 or local storage for images

#### MS-012: Add to Docker Compose
- **Type**: Refactor
- **Estimate**: Small

#### MS-013: Write tests for image generation
- **Type**: Test
- **Estimate**: Medium

### Service 3: Replay Parse (Priority: P1)

#### MS-014: Create ReplayFile entity
- **Type**: Feature
- **Estimate**: Small

#### MS-015: Implement file upload endpoint
- **Type**: Feature
- **Estimate**: Medium

#### MS-016: Port Rocket League replay parser
- **Type**: Refactor
- **Estimate**: Large

#### MS-017: Port Trackmania replay parser
- **Type**: Feature
- **Estimate**: XL
- **Description**: If Trackmania parser exists in v1

#### MS-018: Map parsed data to RoundResult stats
- **Type**: Feature
- **Estimate**: Large

#### MS-019: Add to Docker Compose
- **Type**: Refactor
- **Estimate**: Small

#### MS-020: Write tests with sample replay files
- **Type**: Test
- **Estimate**: Medium

### Service 4: Submissions (Priority: P1)

#### MS-021: Create MatchSubmission workflow entities
- **Type**: Feature
- **Estimate**: Medium

#### MS-022: Migrate submission validation logic to core
- **Type**: Refactor
- **Estimate**: Large

#### MS-023: Replace Redis storage with PostgreSQL
- **Type**: Refactor
- **Estimate**: Large

#### MS-024: Implement transaction-based submission flow
- **Type**: Feature
- **Estimate**: Medium

#### MS-025: Add submission approval/rejection endpoints
- **Type**: Feature
- **Estimate**: Medium

#### MS-026: Trigger notifications on submission events
- **Type**: Feature
- **Estimate**: Small

#### MS-027: Write integration tests for submission flow
- **Type**: Test
- **Estimate**: Medium

### Service 5: Matchmaking (Priority: P1)

#### MS-028: Create ScrimQueueEntry and ScrimTimeout entities
- **Type**: Feature
- **Estimate**: Small

#### MS-029: Port queue management logic from Redis to PostgreSQL
- **Type**: Refactor
- **Estimate**: XL

#### MS-030: Implement matchmaking algorithm
- **Type**: Feature
- **Estimate**: Large

#### MS-031: Create background worker for queue processing
- **Type**: Feature
- **Estimate**: Large

#### MS-032: Add queue join/leave endpoints
- **Type**: Feature
- **Estimate**: Medium

#### MS-033: Implement timeout/cooldown logic
- **Type**: Feature
- **Estimate**: Medium

#### MS-034: Write tests for matchmaking scenarios
- **Type**: Test
- **Estimate**: Large

### Cross-Cutting (Priority: P2)

#### MS-035: Create EventQueue table for event-driven communication
- **Type**: Feature
- **Estimate**: Small

#### MS-036: Implement polling worker for event queue
- **Type**: Feature
- **Estimate**: Medium

#### MS-037: Document event schema and triggers
- **Type**: Documentation
- **Estimate**: Small

---

## Epic 4: Multi-Game ELO System (P2)

**Related Spec**: [feature-multi-game-elo.md](./feature-multi-game-elo.md)

### Database Schema (Priority: P1)

#### ELO-001: Create EloRatingNode entity
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Core rating node entity
- **Acceptance Criteria**:
  - [ ] Entity with player, game, rating, sourceMatch FKs
  - [ ] Migration script
  - [ ] Indexes on player+game

#### ELO-002: Create MatchRatingCalculation entity
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Links match to input/output ratings
- **Acceptance Criteria**:
  - [ ] Entity with match, player, inputRating, outputRating FKs
  - [ ] Migration script

#### ELO-003: Create GameRatingConfig entity
- **Type**: Feature
- **Estimate**: Small
- **Description**: Config for each game's ELO formula
- **Acceptance Criteria**:
  - [ ] Entity with game FK, system enum, parameters JSONB
  - [ ] Migration script

#### ELO-004: Add indexes for rating queries
- **Type**: Refactor
- **Estimate**: Small
- **Description**: Optimize rating lookups
- **Acceptance Criteria**:
  - [ ] Index on (player_id, game_id, created_at DESC)
  - [ ] Index on match_id
  - [ ] Index on input_rating_id

### Rating Calculation (Priority: P1)

#### ELO-005: Implement RatingCalculationService interface
- **Type**: Feature
- **Estimate**: Small

#### ELO-006: Implement EloCalculationService
- **Type**: Feature
- **Estimate**: Large
- **Description**: Standard ELO formula
- **Acceptance Criteria**:
  - [ ] K-factor from config
  - [ ] Expected outcome based on team ratings
  - [ ] Actual outcome from match result

#### ELO-007: Implement GlickoCalculationService (optional)
- **Type**: Feature
- **Estimate**: Large

#### ELO-008: Implement TrueSkillCalculationService (optional)
- **Type**: Feature
- **Estimate**: XL

#### ELO-009: Create PerformanceExtractor for Rocket League
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Extract individual performance from team match
- **Acceptance Criteria**:
  - [ ] Team outcome (win/loss) as primary signal
  - [ ] Optionally weight by stats

#### ELO-010: Create PerformanceExtractor for Trackmania
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Individual placement aggregation
- **Acceptance Criteria**:
  - [ ] Aggregate placements across rounds
  - [ ] Calculate individual rating change

#### ELO-011: Hook rating calculation into match completion flow
- **Type**: Feature
- **Estimate**: Medium
- **Description**: Trigger ELO calculation when match completes
- **Acceptance Criteria**:
  - [ ] Async worker or event trigger
  - [ ] Creates EloRatingNode and MatchRatingCalculation entries

### Invalidation & Recalculation (Priority: P2)

#### ELO-012: Implement findDependentMatches query
- **Type**: Feature
- **Estimate**: Medium

#### ELO-013: Implement topological sort for match dependencies
- **Type**: Feature
- **Estimate**: Large

#### ELO-014: Implement recalculateMatchRatings logic
- **Type**: Feature
- **Estimate**: Large

#### ELO-015: Implement invalidateMatch flow with transaction safety
- **Type**: Feature
- **Estimate**: Large

### Graph Compaction (Priority: P3)

#### ELO-016: Implement compactPlayerRatings logic
- **Type**: Feature
- **Estimate**: Medium

#### ELO-017: Create admin endpoint to trigger compaction
- **Type**: Feature
- **Estimate**: Small

#### ELO-018: Add scheduled job for periodic compaction (optional)
- **Type**: Feature
- **Estimate**: Small

### Migration from DGraph (Priority: P2)

#### ELO-019: Export data from DGraph
- **Type**: Refactor
- **Estimate**: Medium

#### ELO-020: Write import script for historical ratings
- **Type**: Feature
- **Estimate**: Large

#### ELO-021: Validate imported data integrity
- **Type**: Test
- **Estimate**: Medium

#### ELO-022: Compare v1 vs v2 ratings for sample players
- **Type**: Test
- **Estimate**: Medium

### API Endpoints (Priority: P2)

#### ELO-023: GET /players/:id/ratings/:game
- **Type**: Feature
- **Estimate**: Small

#### ELO-024: GET /players/:id/rating-history/:game
- **Type**: Feature
- **Estimate**: Small

#### ELO-025: GET /leaderboard/:game
- **Type**: Feature
- **Estimate**: Medium

#### ELO-026: GET /matches/:id/rating-changes
- **Type**: Feature
- **Estimate**: Small

#### ELO-027: POST /admin/ratings/compact/:game
- **Type**: Feature
- **Estimate**: Small

#### ELO-028: POST /admin/matches/:id/invalidate
- **Type**: Feature
- **Estimate**: Medium

### Testing (Priority: P2)

#### ELO-029: Unit tests for each rating formula
- **Type**: Test
- **Estimate**: Medium

#### ELO-030: Integration tests for rating calculation flow
- **Type**: Test
- **Estimate**: Large

#### ELO-031: Integration tests for invalidation and recalculation
- **Type**: Test
- **Estimate**: Large

---

## Epic 5: RBAC System Enhancement (P2)

**Related Spec**: [feature-rbac-system.md](./feature-rbac-system.md)

### Database Schema (Priority: P1)

#### RBAC-001: Set up Casbin TypeORM adapter
- **Type**: Feature
- **Estimate**: Small

#### RBAC-002: Create RoleDefinition entity
- **Type**: Feature
- **Estimate**: Small

#### RBAC-003: Create UserRole entity
- **Type**: Feature
- **Estimate**: Small

#### RBAC-004: Create PermissionAuditLog entity
- **Type**: Feature
- **Estimate**: Small

#### RBAC-005: Seed default roles
- **Type**: Feature
- **Estimate**: Small
- **Description**: Player, Captain, GM, FM, League Ops, Admin

#### RBAC-006: Seed default policies for each role
- **Type**: Feature
- **Estimate**: Medium

### Backend Services (Priority: P1)

#### RBAC-007: Implement RbacService wrapping Casbin enforcer
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-008: Implement role management CRUD
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-009: Implement permission management
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-010: Implement user role assignment
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-011: Implement approval workflow for sensitive roles
- **Type**: Feature
- **Estimate**: Large

#### RBAC-012: Implement audit logging for all permission changes
- **Type**: Feature
- **Estimate**: Small

#### RBAC-013: Implement policy testing endpoint
- **Type**: Feature
- **Estimate**: Small

### Admin UI (Priority: P2)

#### RBAC-014: Create role management UI
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-015: Create permission assignment UI
- **Type**: Feature
- **Estimate**: Large

#### RBAC-016: Create user role assignment UI
- **Type**: Feature
- **Estimate**: Large

#### RBAC-017: Create approval workflow UI
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-018: Create policy testing UI
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-019: Create audit log viewer UI
- **Type**: Feature
- **Estimate**: Medium

### Integration (Priority: P1)

#### RBAC-020: Add RBAC guards to all API endpoints
- **Type**: Refactor
- **Estimate**: XL
- **Description**: Apply permission checks across entire API

#### RBAC-021: Implement scope resolution logic
- **Type**: Feature
- **Estimate**: Large

#### RBAC-022: Add permission checks to roster management
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-023: Add permission checks to schedule management
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-024: Add permission checks to scrim endpoints
- **Type**: Feature
- **Estimate**: Medium

#### RBAC-025: Add permission checks to submission endpoints
- **Type**: Feature
- **Estimate**: Medium

### Testing (Priority: P2)

#### RBAC-026: Unit tests for Casbin policy enforcement
- **Type**: Test
- **Estimate**: Medium

#### RBAC-027: Integration tests for role assignment workflow
- **Type**: Test
- **Estimate**: Medium

#### RBAC-028: Security tests for privilege escalation
- **Type**: Test
- **Estimate**: Large

---

## Epic 6: API Token & Impersonation System (P2)

**Related Spec**: [feature-api-tokens.md](./feature-api-tokens.md)

### Database Schema (Priority: P1)

#### TOKEN-001: Create ApiToken entity
- **Type**: Feature
- **Estimate**: Small

#### TOKEN-002: Create ApiTokenUsageLog entity
- **Type**: Feature
- **Estimate**: Small

#### TOKEN-003: Add indexes for token lookup and usage logs
- **Type**: Refactor
- **Estimate**: Small

### Backend Services (Priority: P1)

#### TOKEN-004: Implement token generation service
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-005: Implement token authentication guard
- **Type**: Feature
- **Estimate**: Large

#### TOKEN-006: Implement rate limiting per token
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-007: Implement usage logging
- **Type**: Feature
- **Estimate**: Small

#### TOKEN-008: Implement token CRUD
- **Type**: Feature
- **Estimate**: Medium

### User UI (Priority: P2)

#### TOKEN-009: Create token management screen
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-010: Create token creation flow
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-011: Create token revocation flow
- **Type**: Feature
- **Estimate**: Small

#### TOKEN-012: Show token once after creation
- **Type**: Feature
- **Estimate**: Small

### Admin UI (Priority: P2)

#### TOKEN-013: Create all tokens list
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-014: Create token detail view
- **Type**: Feature
- **Estimate**: Medium

#### TOKEN-015: Create admin token revocation flow
- **Type**: Feature
- **Estimate**: Small

### Integration (Priority: P1)

#### TOKEN-016: Add token authentication to all API endpoints
- **Type**: Refactor
- **Estimate**: Large

#### TOKEN-017: Integrate token scopes with RBAC enforcement
- **Type**: Feature
- **Estimate**: Large

#### TOKEN-018: Add rate limiting middleware
- **Type**: Feature
- **Estimate**: Small

#### TOKEN-019: Add usage logging middleware
- **Type**: Feature
- **Estimate**: Small

### Testing (Priority: P2)

#### TOKEN-020: Unit tests for token generation and hashing
- **Type**: Test
- **Estimate**: Small

#### TOKEN-021: Integration tests for token authentication flow
- **Type**: Test
- **Estimate**: Medium

#### TOKEN-022: Security tests for privilege escalation
- **Type**: Test
- **Estimate**: Medium

---

## Epic 7: League Management UI (P1)

**Related Spec**: [feature-league-management.md](./feature-league-management.md)

### Database Schema (Priority: P0)

#### LM-001: Create League entity
- **Type**: Feature
- **Estimate**: Small

#### LM-002: Create Franchise entity
- **Type**: Feature
- **Estimate**: Small

#### LM-003: Create Club entity
- **Type**: Feature
- **Estimate**: Small

#### LM-004: Create Team entity
- **Type**: Feature
- **Estimate**: Small

#### LM-005: Create SkillGroup entity
- **Type**: Feature
- **Estimate**: Small

#### LM-006: Create RosterSpot entity
- **Type**: Feature
- **Estimate**: Small

#### LM-007: Create RosterOffer entity
- **Type**: Feature
- **Estimate**: Small

#### LM-008: Create Season entity
- **Type**: Feature
- **Estimate**: Small

#### LM-009: Create FranchiseRole, ClubRole, TeamRole entities
- **Type**: Feature
- **Estimate**: Medium

#### LM-010: Add indexes for common queries
- **Type**: Refactor
- **Estimate**: Small

### Backend Services (Priority: P1)

#### LM-011: Implement franchise CRUD service
- **Type**: Feature
- **Estimate**: Medium

#### LM-012: Implement club CRUD service
- **Type**: Feature
- **Estimate**: Medium

#### LM-013: Implement team CRUD service
- **Type**: Feature
- **Estimate**: Medium

#### LM-014: Implement roster management service
- **Type**: Feature
- **Estimate**: Large

#### LM-015: Implement roster offer service
- **Type**: Feature
- **Estimate**: Large

#### LM-016: Implement role assignment service
- **Type**: Feature
- **Estimate**: Large

#### LM-017: Implement season management service
- **Type**: Feature
- **Estimate**: Medium

#### LM-018: Add RBAC permission checks to all endpoints
- **Type**: Feature
- **Estimate**: Large

### UI Components (Priority: P1)

#### LM-019: Organizational hierarchy tree view
- **Type**: Feature
- **Estimate**: Large

#### LM-020: Franchise detail page and edit form
- **Type**: Feature
- **Estimate**: Medium

#### LM-021: Club detail page and edit form
- **Type**: Feature
- **Estimate**: Medium

#### LM-022: Team detail page and edit form
- **Type**: Feature
- **Estimate**: Medium

#### LM-023: Roster management interface
- **Type**: Feature
- **Estimate**: XL

#### LM-024: Roster offer interface
- **Type**: Feature
- **Estimate**: Large

#### LM-025: Role assignment interface
- **Type**: Feature
- **Estimate**: Large

#### LM-026: Season management interface
- **Type**: Feature
- **Estimate**: Medium

### Validation & Business Logic (Priority: P1)

#### LM-027: Validate roster size limits
- **Type**: Feature
- **Estimate**: Small

#### LM-028: Prevent duplicate roster spots
- **Type**: Feature
- **Estimate**: Small

#### LM-029: Validate skill group matching for roster adds
- **Type**: Feature
- **Estimate**: Small

#### LM-030: Implement approval workflow for role assignments
- **Type**: Feature
- **Estimate**: Medium

#### LM-031: Validate season dates
- **Type**: Feature
- **Estimate**: Small

### Testing (Priority: P2)

#### LM-032: Unit tests for roster validation logic
- **Type**: Test
- **Estimate**: Medium

#### LM-033: Integration tests for roster management flows
- **Type**: Test
- **Estimate**: Large

#### LM-034: E2E tests for full roster management workflow
- **Type**: Test
- **Estimate**: Large

---

## Summary by Priority

### P0 (Critical - Must Complete First)
- V1 Microservices Migration (Epic 1) - Core consolidation and PostgreSQL events
- Multi-Game Data Model DB Schema (MGDM-001 through MGDM-008)
- League Management DB Schema (LM-001 through LM-010)

### P1 (High - Core Features)
- Multi-Game Data Model (Epic 2) - remaining implementation
- Remaining Microservices Migration (Notifications, Image Gen, Replay Parse)
- League Management (Epic 7) - backend services
- RBAC System DB Schema and Backend Services
- Multi-Game ELO DB Schema and Rating Calculation

### P2 (Medium - Important but not blocking)
- RBAC System UI and Integration
- Multi-Game ELO Invalidation and API Endpoints
- API Tokens System
- All Documentation tasks

### P3 (Low - Nice to have)
- Graph Compaction features
- Advanced ELO features (Glicko, TrueSkill)

---

## Recommended Development Order

1. **V1 Microservices Migration - Phase 1** (Epic 1)
   - Consolidate Matchmaking into Core service
   - Consolidate Submissions into Core service
   - Remove Redis infrastructure

2. **Foundation Data Models** (Epics 2 & 7)
   - Multi-Game Data Model DB schema
   - League Management DB schema
   - Core backend services for both

3. **V1 Microservices Migration - Phase 2** (Epic 1)
   - Implement PostgreSQL event system
   - Migrate Notifications service
   - Migrate Image Generation service
   - Migrate Replay Parse service
   - Remove RabbitMQ infrastructure

4. **Multi-Game Data Model Implementation** (Epic 2)
   - Game configuration system
   - Validation and business logic
   - API endpoints

5. **RBAC System** (Epic 5)
   - Database schema and backend services
   - Basic integration with existing endpoints

6. **Multi-Game ELO System** (Epic 4)
   - Database schema and rating calculation
   - Integration with match completion flow

7. **League Management Implementation** (Epic 7)
   - Backend services completion
   - UI components

8. **RBAC Admin UI** (Epic 5)
   - Role management interfaces
   - Permission assignment interfaces

9. **API Tokens System** (Epic 6)
   - Token generation and authentication
   - User and admin interfaces

10. **Polish, testing, documentation** (All epics)

This order ensures:
- Unified architecture provides solid foundation
- Data models support all future features
- Core workflows work before adding advanced features
- RBAC is in place before exposing management UIs
- Infrastructure complexity is reduced early
