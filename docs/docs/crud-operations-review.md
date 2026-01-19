# CRUD Operations Review: Comprehensive Analysis and Implementation Roadmap

## Executive Summary

This document presents a comprehensive analysis of the current CRUD (Create, Read, Update, Delete) operations across the Sprocket Core codebase. Our analysis reveals a **partially implemented CRUD interface** with significant gaps that need to be addressed for full data management capabilities.

### Key Findings
- **12 entity groups** identified in the data model
- **Read operations** are well-implemented across most entities
- **Create/Update/Delete operations** are severely limited or missing entirely
- **Authorization gaps** exist for many operations
- **Query capabilities** are basic and lack advanced filtering
- **6-phase implementation roadmap** required over 12 weeks

### Critical Priority Issues
1. **No Create/Update/Delete operations** for core business entities (Franchise, Club, Team, Season)
2. **Limited authorization** on existing operations
3. **Missing bulk operations** and advanced query features
4. **No soft delete functionality** implemented
5. **Inconsistent error handling** patterns

## Current State Overview

### Data Model Architecture

The codebase implements a **hierarchical esports organization model** with the following entity groups:

```
Franchise (Top Level)
├── Clubs (Game-specific organizations)
│   ├── Teams (Competitive teams)
│   │   ├── Players (Individual competitors)
│   │   ├── RosterSpots (Team membership)
│   │   └── TeamRoles (Leadership positions)
│   └── ClubRoles (Management positions)
└── FranchiseRoles (Executive positions)
```

**Supporting Entities:**
- **Game Management**: Game, GameMode, SkillGroup
- **Competition**: Match, Round, Fixture, Scrim
- **Statistics**: PlayerStat, TeamStat
- **System**: User, Role, ApiToken, Notification
- **Operations**: MatchSubmission, EventQueue, Metrics, Logs

### Entity Inventory (12 Groups)

| Entity Group | Entities | Current CRUD Status |
|--------------|----------|-------------------|
| **Core Organization** | Franchise, Club, Team | ❌ No C/UD, ✅ Limited R |
| **Player Management** | Player, User | ✅ CRUD (Partial) |
| **Competition** | Match, Round, Fixture, Scrim | ✅ R only, ❌ C/UD |
| **Statistics** | PlayerStat, TeamStat | ✅ R only, ❌ C/UD |
| **Game System** | Game, GameMode, SkillGroup | ✅ R only, ❌ C/UD |
| **Access Control** | Role, ApiToken | ✅ CRUD (Good) |
| **Operations** | MatchSubmission, EventQueue | ✅ R only, ❌ C/UD |
| **Observability** | Metrics, Logs | ✅ R only, ❌ C/UD |
| **Notifications** | NotificationTemplate, NotificationHistory | ✅ R only, ❌ C/UD |
| **Queue System** | ScrimQueue, ScrimTimeout | ✅ R only, ❌ C/UD |
| **Schedule** | ScheduleGroup, ScheduleGroupType | ✅ R only, ❌ C/UD |
| **Season Management** | Season | ✅ R only, ❌ C/UD |

## What's Working Well

### 1. Read Operations (✅ Implemented)

**Core Entities Resolver** provides consistent read-by-ID patterns:

```typescript
// Example from core_entities.resolver.ts
@Query(() => MatchObject, { nullable: true })
async getMatchById(@Args('id') id: string): Promise<MatchEntity | null> {
  return this.matchRepo.findOne({ where: { id } });
}
```

**Entity-Specific Resolvers** implement list operations:

```typescript
// From team.resolver.ts
@Query(() => [TeamObject])
async teams(): Promise<TeamObject[]> {
  return this.teamRepo.find();
}
```

**Relationship Resolution** works effectively:

```typescript
// From team.resolver.ts
@ResolveField(() => SkillGroupObject)
async skillGroup(@Root() root: TeamObject) {
  if (root.skillGroup) return root.skillGroup;
  const team = await this.teamRepo.findOneOrFail({
    where: { id: root.id },
    relations: ['skillGroup'],
  });
  return team.skillGroup;
}
```

**File References**:
- [`core_entities.resolver.ts`](core/src/gql/core_entities.resolver.ts#L62-65) - Match read operation
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L20-23) - Team list operation  
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L32-40) - Relationship resolution pattern
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L49-109) - Advanced query with filtering and search
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts#L20-23) - Club list operation
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts#L18-21) - Franchise list operation
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts#L10-13) - Season list operation
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts#L15-19) - Season by ID operation

### 2. Authorization System (✅ Partial)

**RBAC Implementation** using Casbin:

```typescript
// From user.resolver.ts
@UsePermissions({
  resource: Resource.User,
  action: ResourceAction.Read,
  possession: AuthPossession.OWN,
})
```

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L31-37) - Authorization example
- [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) - RBAC guard implementation
- [`current-user.decorator.ts`](core/src/auth/current-user/current-user.decorator.ts) - Current user injection
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111-122) - Mutation with authorization TODO comment

### 3. User Management (✅ Good)

**User Operations**:
- User search with fuzzy matching
- Active status management
- Profile relationships (players, accounts)
- Authentication integration

**Player Operations**:
- Player creation/update/deletion
- Skill group management
- Salary management

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L80-97) - Fuzzy search implementation
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111-122) - User status mutation
- [`user.repository.ts`](core/src/db/user/user.repository.ts) - User repository with search methods
- [`schema.gql`](core/schema.gql#L661-664) - Player CRUD mutations in GraphQL schema

### 4. Scrim System (✅ Functional)

**Scrim Operations**:
- Scrim creation/destruction
- Player join/leave operations
- State management
- Queue integration

**File References**:
- [`schema.gql`](core/schema.gql#L657-660) - Scrim mutations in GraphQL schema
- [`scrim.entity.ts`](core/src/db/scrim/scrim.entity.ts) - Scrim entity definition
- [`scrim_queue.entity.ts`](core/src/db/scrim_queue/scrim_queue.entity.ts) - Queue system entity
- [`scrim_timeout.entity.ts`](core/src/db/scrim_timeout/scrim_timeout.entity.ts) - Timeout management entity

## Critical Gaps Identified

### 🔴 Priority 1: Core Business Entity Management

#### Franchise Operations
**Current State**: Read-only (`franchise`, `franchises`)
**Missing**:
- ❌ Create franchise
- ❌ Update franchise details
- ❌ Delete/Deactivate franchise
- ❌ Franchise role management

**File References**:
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts#L11-21) - Only read operations implemented
- [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts) - Entity definition ready for CRUD
- [`franchise.repository.ts`](core/src/db/franchise/franchise.repository.ts) - Repository ready for CRUD operations

**Impact**: **BLOCKING** - Cannot onboard new organizations

#### Club Operations  
**Current State**: Read-only (`club`, `clubs`)
**Missing**:
- ❌ Create club under franchise
- ❌ Update club details
- ❌ Delete/Deactivate club
- ❌ Club role assignment

**File References**:
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts#L13-23) - Only read operations implemented
- [`club.entity.ts`](core/src/db/club/club.entity.ts) - Entity definition ready for CRUD
- [`club.repository.ts`](core/src/db/club/club.repository.ts) - Repository ready for CRUD operations

**Impact**: **BLOCKING** - Cannot create game-specific organizations

#### Team Operations
**Current State**: Read-only (`team`, `teams`)
**Missing**:
- ❌ Create team under club
- ❌ Update team details (name, slug, roster limits)
- ❌ Deactivate team
- ❌ Team role management beyond basic assignment

**File References**:
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L13-23) - Only read operations implemented
- [`team.entity.ts`](core/src/db/team/team.entity.ts) - Entity definition ready for CRUD
- [`team.repository.ts`](core/src/db/team/team.repository.ts) - Repository ready for CRUD operations

**Impact**: **BLOCKING** - Cannot form competitive teams

#### Season Management
**Current State**: Read-only (`season`, `seasons`)
**Missing**:
- ❌ Create season
- ❌ Update season status
- ❌ Season scheduling
- ❌ Season closure

**File References**:
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts#L9-19) - Only read operations implemented
- [`season.entity.ts`](core/src/db/season/season.entity.ts) - Entity definition ready for CRUD

**Impact**: **HIGH** - Cannot manage competitive seasons

### 🔴 Priority 2: Authorization and Security

#### Missing Authorization on Core Operations
```typescript
// From user.resolver.ts - Missing proper authorization
@Mutation(() => UserObject)
@UseGuards(AuthorizeGuard()) // TODO: authz
async alterUserActiveStatus(
  @Args('active') active: boolean,
  @Args('userId') userId: string,
) {
  // No permission check!
}
```

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111) - TODO comment indicating missing authorization
- [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) - Authorization guard implementation
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L55-61) - Commented out authorization code

#### Role Management Gaps
- ❌ Franchise role assignment/removal
- ❌ Club role assignment/removal  
- ❌ Team role bulk operations
- ❌ Role approval workflows

**File References**:
- [`franchise_role.entity.ts`](core/src/db/franchise_role/franchise_role.entity.ts) - Franchise role entity
- [`club_role.entity.ts`](core/src/db/club_role/club_role.entity.ts) - Club role entity
- [`team_role.entity.ts`](core/src/db/team_role/team_role.entity.ts) - Team role entity
- [`role.entity.ts`](core/src/db/role/role.entity.ts) - Base role entity

### 🔴 Priority 3: Advanced Query Capabilities

#### Limited Filtering and Search
**Current Issues**:
- Basic ID-based queries only
- No advanced filtering (status, dates, relationships)
- No pagination on list operations
- No sorting capabilities
- No full-text search

**Missing Query Features**:
- ❌ Active/inactive entity filtering
- ❌ Date range queries
- ❌ Relationship-based filtering
- ❌ Complex boolean logic
- ❌ Aggregation queries

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L63-103) - Advanced filtering example (limited to users)
- [`core_entities.resolver.ts`](core/src/gql/core_entities.resolver.ts#L62-152) - Basic ID-only queries for all entities
- [`user.repository.ts`](core/src/db/user/user.repository.ts) - Search implementation (could be generalized)

### 🔴 Priority 4: Bulk Operations and Data Management

#### Missing Bulk Operations
- ❌ Bulk user activation/deactivation
- ❌ Bulk role assignments
- ❌ Bulk team roster updates
- ❌ Bulk entity imports/exports

#### Data Integrity Issues
- ❌ No soft delete functionality
- ❌ No cascade delete protection
- ❌ No data validation on relationships
- ❌ No referential integrity checks

**File References**:
- [`base.entity.ts`](core/src/db/base.entity.ts) - Base entity without soft delete
- [`user.entity.ts`](core/src/db/user/user.entity.ts) - User entity with active flag (could be soft delete)
- [`team.entity.ts`](core/src/db/team/team.entity.ts) - Team entity with isActive flag
- [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts) - Franchise entity with isActive flag

### 🔴 Priority 5: Error Handling and Validation

#### Inconsistent Error Patterns
```typescript
// Mixed error handling approaches
if (!targetUser) throw new Error(`User not found`); // Generic errors
if (query.limit > 50) throw new Error(`Limit must be <= 50`); // Business logic errors
```

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L44) - Generic error throwing
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L99) - Business logic error
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L118) - User not found error

#### Missing Validation
- ❌ Input validation on mutations
- ❌ Business rule validation
- ❌ Relationship validation
- ❌ Data consistency checks

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L99) - Basic limit validation only
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L63-103) - Manual filtering logic (should be in service layer)

### 2. Authorization System (✅ Partial)

**RBAC Implementation** using Casbin:

```typescript
// From user.resolver.ts
@UsePermissions({
  resource: Resource.User,
  action: ResourceAction.Read,
  possession: AuthPossession.OWN,
})
```

**API Token Management** (✅ Complete):
- Token generation with scopes
- Token revocation
- Usage tracking
- Expiration handling

### 3. User Management (✅ Good)

**User Operations**:
- User search with fuzzy matching
- Active status management
- Profile relationships (players, accounts)
- Authentication integration

**Player Operations**:
- Player creation/update/deletion
- Skill group management
- Salary management

### 4. Scrim System (✅ Functional)

**Scrim Operations**:
- Scrim creation/destruction
- Player join/leave operations
- State management
- Queue integration

## Critical Gaps Identified

### 🔴 Priority 1: Core Business Entity Management

#### Franchise Operations
**Current State**: Read-only (`franchise`, `franchises`)
**Missing**:
- ❌ Create franchise
- ❌ Update franchise details
- ❌ Delete/Deactivate franchise
- ❌ Franchise role management

**Impact**: **BLOCKING** - Cannot onboard new organizations

#### Club Operations  
**Current State**: Read-only (`club`, `clubs`)
**Missing**:
- ❌ Create club under franchise
- ❌ Update club details
- ❌ Delete/Deactivate club
- ❌ Club role assignment

**Impact**: **BLOCKING** - Cannot create game-specific organizations

#### Team Operations
**Current State**: Read-only (`team`, `teams`)
**Missing**:
- ❌ Create team under club
- ❌ Update team details (name, slug, roster limits)
- ❌ Deactivate team
- ❌ Team role management beyond basic assignment

**Impact**: **BLOCKING** - Cannot form competitive teams

#### Season Management
**Current State**: Read-only (`season`, `seasons`)
**Missing**:
- ❌ Create season
- ❌ Update season status
- ❌ Season scheduling
- ❌ Season closure

**Impact**: **HIGH** - Cannot manage competitive seasons

### 🔴 Priority 2: Authorization and Security

#### Missing Authorization on Core Operations
```typescript
// From user.resolver.ts - Missing proper authorization
@Mutation(() => UserObject)
@UseGuards(AuthorizeGuard()) // TODO: authz
async alterUserActiveStatus(
  @Args('active') active: boolean,
  @Args('userId') userId: string,
) {
  // No permission check!
}
```

#### Role Management Gaps
- ❌ Franchise role assignment/removal
- ❌ Club role assignment/removal  
- ❌ Team role bulk operations
- ❌ Role approval workflows

### 🔴 Priority 3: Advanced Query Capabilities

#### Limited Filtering and Search
**Current Issues**:
- Basic ID-based queries only
- No advanced filtering (status, dates, relationships)
- No pagination on list operations
- No sorting capabilities
- No full-text search

**Missing Query Features**:
- ❌ Active/inactive entity filtering
- ❌ Date range queries
- ❌ Relationship-based filtering
- ❌ Complex boolean logic
- ❌ Aggregation queries

### 🔴 Priority 4: Bulk Operations and Data Management

#### Missing Bulk Operations
- ❌ Bulk user activation/deactivation
- ❌ Bulk role assignments
- ❌ Bulk team roster updates
- ❌ Bulk entity imports/exports

#### Data Integrity Issues
- ❌ No soft delete functionality
- ❌ No cascade delete protection
- ❌ No data validation on relationships
- ❌ No referential integrity checks

### 🔴 Priority 5: Error Handling and Validation

#### Inconsistent Error Patterns
```typescript
// Mixed error handling approaches
if (!targetUser) throw new Error(`User not found`); // Generic errors
if (query.limit > 50) throw new Error(`Limit must be <= 50`); // Business logic errors
```

#### Missing Validation
- ❌ Input validation on mutations
- ❌ Business rule validation
- ❌ Relationship validation
- ❌ Data consistency checks

## Detailed Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2) 🎯
**Goal**: Establish consistent patterns and implement core entity management

#### Week 1: Core Franchise Operations
```typescript
// Target: core/src/gql/franchise/franchise.resolver.ts
@Mutation(() => FranchiseObject)
@UsePermissions({
  resource: Resource.Franchise,
  action: ResourceAction.Create,
  possession: AuthPossession.ANY,
})
async createFranchise(
  @Args('input') input: CreateFranchiseInput,
): Promise<FranchiseObject> {
  // Implementation
}

@Mutation(() => FranchiseObject)
@UsePermissions({
  resource: Resource.Franchise,
  action: ResourceAction.Update,
  possession: AuthPossession.ANY,
})
async updateFranchise(
  @Args('id') id: string,
  @Args('input') input: UpdateFranchiseInput,
): Promise<FranchiseObject> {
  // Implementation
}
```

**Implementation Files**:
- Start with [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts) - Add mutations following existing patterns
- Reference [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111-122) for mutation structure
- Use [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts) for data model
- Follow [`franchise.repository.ts`](core/src/db/franchise/franchise.repository.ts) patterns

**Deliverables**:
- ✅ Franchise CRUD operations
- ✅ Input validation schemas
- ✅ Authorization guards
- ✅ Error handling patterns
- ✅ Unit tests

#### Week 2: Club and Team Operations
**Implementation Files**:
- Extend [`club.resolver.ts`](core/src/gql/club/club.resolver.ts) with CRUD mutations
- Extend [`team.resolver.ts`](core/src/gql/team/team.resolver.ts) with CRUD mutations
- Reference [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L661-664) for GraphQL mutation patterns
- Use [`club.entity.ts`](core/src/db/club/club.entity.ts) and [`team.entity.ts`](core/src/db/team/team.entity.ts) for data models

**Deliverables**:
- ✅ Club CRUD operations
- ✅ Team CRUD operations  
- ✅ Hierarchical relationship management
- ✅ Role-based authorization
- ✅ Integration tests

**File References**:
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts) - Target file for implementation
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts) - Target file for implementation
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts) - Target file for implementation
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111-122) - Reference for mutation patterns
- [`schema.gql`](core/schema.gql#L661-664) - GraphQL schema reference for mutations

### Phase 2: Season Management (Week 3) 🎯
**Goal**: Implement complete season lifecycle management

**Implementation Files**:
- Extend [`season.resolver.ts`](core/src/gql/season/season.resolver.ts) with CRUD operations
- Reference [`season.entity.ts`](core/src/db/season/season.entity.ts) for data model
- Follow season status management patterns from [`season.entity.ts`](core/src/db/season/season.entity.ts#L15-19)

**Deliverables**:
- ✅ Season CRUD operations
- ✅ Season status management
- ✅ Season scheduling integration
- ✅ Season closure procedures
- ✅ Historical data preservation

**File References**:
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts) - Target file for implementation
- [`season.entity.ts`](core/src/db/season/season.entity.ts) - Data model reference
- [`season.repository.ts`](core/src/db/season/season.repository.ts) - Repository layer reference

### Phase 3: Advanced Authorization (Weeks 4-5) 🎯
**Goal**: Complete the authorization system for all operations

#### Week 4: Role Management System
**Implementation Files**:
- Implement role operations in franchise, club, and team resolvers
- Reference [`role.entity.ts`](core/src/db/role/role.entity.ts) for role data model
- Use [`franchise_role.entity.ts`](core/src/db/franchise_role/franchise_role.entity.ts), [`club_role.entity.ts`](core/src/db/club_role/club_role.entity.ts), [`team_role.entity.ts`](core/src/db/team_role/team_role.entity.ts) for specific role types

**Deliverables**:
- ✅ Franchise role operations
- ✅ Club role operations
- ✅ Team role operations
- ✅ Role approval workflows
- ✅ Permission audit logging

**File References**:
- [`franchise_role.entity.ts`](core/src/db/franchise_role/franchise_role.entity.ts) - Franchise role data model
- [`club_role.entity.ts`](core/src/db/club_role/club_role.entity.ts) - Club role data model
- [`team_role.entity.ts`](core/src/db/team_role/team_role.entity.ts) - Team role data model
- [`role.entity.ts`](core/src/db/role/role.entity.ts) - Base role entity
- [`permission_audit_log.entity.ts`](core/src/db/permission_audit_log/permission_audit_log.entity.ts) - Audit logging entity

#### Week 5: Authorization Integration
**Implementation Files**:
- Add authorization to all existing operations
- Reference [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) for authorization patterns
- Use [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L31-37) as authorization example

**Deliverables**:
- ✅ Authorization on all existing operations
- ✅ Permission inheritance
- ✅ Scope-based access control
- ✅ API token scope validation
- ✅ Authorization testing suite

**File References**:
- [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) - Authorization guard implementation
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L31-37) - Authorization pattern example
- [`current-user.decorator.ts`](core/src/auth/current-user/current-user.decorator.ts) - Current user injection

### Phase 4: Query Enhancement (Weeks 6-8) 🔧
**Goal**: Implement advanced query capabilities and filtering

#### Week 6: Advanced Filtering
**Implementation Files**:
- Extend query capabilities in core entities resolver
- Reference [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L63-103) for advanced filtering patterns
- Generalize filtering system for all entities

**Deliverables**:
- ✅ Generic filtering system
- ✅ Date range queries
- ✅ Status-based filtering
- ✅ Relationship filtering
- ✅ Boolean logic queries

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L63-103) - Advanced filtering reference
- [`core_entities.resolver.ts`](core/src/gql/core_entities.resolver.ts#L62-152) - Target for enhancement
- [`user.repository.ts`](core/src/db/user/user.repository.ts) - Repository filtering patterns

#### Week 7: Search and Pagination
**Implementation Files**:
- Implement full-text search using existing patterns from [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L80-97)
- Add pagination to all list operations
- Reference [`user.repository.ts`](core/src/db/user/user.repository.ts) for search implementation

**Deliverables**:
- ✅ Full-text search implementation
- ✅ Pagination system
- ✅ Sorting capabilities
- ✅ Search indexing
- ✅ Performance optimization

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L80-97) - Search implementation reference
- [`user.repository.ts`](core/src/db/user/user.repository.ts) - Search repository patterns

#### Week 8: Aggregation and Analytics
**Implementation Files**:
- Create aggregation service layer
- Implement statistical functions
- Add report generation capabilities

**Deliverables**:
- ✅ Aggregation queries
- ✅ Statistical functions
- ✅ Report generation
- ✅ Data export capabilities
- ✅ Caching layer

### Phase 5: Bulk Operations (Weeks 9-10) 🔧
**Goal**: Implement bulk operations and data management features

#### Week 9: Bulk Operations Framework
**Implementation Files**:
- Create bulk operation service layer
- Implement transaction management
- Reference existing patterns for single operations

**Deliverables**:
- ✅ Bulk operation framework
- ✅ Bulk user management
- ✅ Bulk role assignments
- ✅ Transaction management
- ✅ Progress tracking

#### Week 10: Data Import/Export
**Implementation Files**:
- Implement CSV/JSON import/export
- Create data validation pipeline
- Add rollback capabilities

**Deliverables**:
- ✅ CSV import/export
- ✅ JSON data exchange
- ✅ Data validation pipeline
- ✅ Import validation
- ✅ Rollback capabilities

### Phase 6: Data Integrity and Validation (Weeks 11-12) 🔧
**Goal**: Implement comprehensive data validation and integrity features

#### Week 11: Validation and Constraints
**Implementation Files**:
- Create validation service layer
- Implement business rule validation
- Add relationship validation

**Deliverables**:
- ✅ Input validation system
- ✅ Business rule validation
- ✅ Relationship validation
- ✅ Data consistency checks
- ✅ Validation error handling

#### Week 12: Data Integrity Features
**Implementation Files**:
- Implement soft delete functionality
- Add cascade delete protection
- Create data audit trail

**Deliverables**:
- ✅ Soft delete implementation
- ✅ Cascade delete protection
- ✅ Referential integrity
- ✅ Data audit trail
- ✅ Integrity monitoring

**File References**:
- [`base.entity.ts`](core/src/db/base.entity.ts) - Base entity for soft delete extension
- [`user.entity.ts`](core/src/db/user/user.entity.ts#L18) - Example of active flag (soft delete pattern)
- [`team.entity.ts`](core/src/db/team/team.entity.ts#L16) - Example of isActive flag (soft delete pattern)
- [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts#L16) - Example of isActive flag (soft delete pattern)

### Phase 2: Season Management (Week 3) 🎯
**Goal**: Implement complete season lifecycle management

**Deliverables**:
- ✅ Season CRUD operations
- ✅ Season status management
- ✅ Season scheduling integration
- ✅ Season closure procedures
- ✅ Historical data preservation

### Phase 3: Advanced Authorization (Weeks 4-5) 🎯
**Goal**: Complete the authorization system for all operations

#### Week 4: Role Management System
**Deliverables**:
- ✅ Franchise role operations
- ✅ Club role operations
- ✅ Team role operations
- ✅ Role approval workflows
- ✅ Permission audit logging

#### Week 5: Authorization Integration
**Deliverables**:
- ✅ Authorization on all existing operations
- ✅ Permission inheritance
- ✅ Scope-based access control
- ✅ API token scope validation
- ✅ Authorization testing suite

### Phase 4: Query Enhancement (Weeks 6-8) 🔧
**Goal**: Implement advanced query capabilities and filtering

#### Week 6: Advanced Filtering
**Deliverables**:
- ✅ Generic filtering system
- ✅ Date range queries
- ✅ Status-based filtering
- ✅ Relationship filtering
- ✅ Boolean logic queries

#### Week 7: Search and Pagination
**Deliverables**:
- ✅ Full-text search implementation
- ✅ Pagination system
- ✅ Sorting capabilities
- ✅ Search indexing
- ✅ Performance optimization

#### Week 8: Aggregation and Analytics
**Deliverables**:
- ✅ Aggregation queries
- ✅ Statistical functions
- ✅ Report generation
- ✅ Data export capabilities
- ✅ Caching layer

### Phase 5: Bulk Operations (Weeks 9-10) 🔧
**Goal**: Implement bulk operations and data management features

#### Week 9: Bulk Operations Framework
**Deliverables**:
- ✅ Bulk operation framework
- ✅ Bulk user management
- ✅ Bulk role assignments
- ✅ Transaction management
- ✅ Progress tracking

#### Week 10: Data Import/Export
**Deliverables**:
- ✅ CSV import/export
- ✅ JSON data exchange
- ✅ Data validation pipeline
- ✅ Import validation
- ✅ Rollback capabilities

### Phase 6: Data Integrity and Validation (Weeks 11-12) 🔧
**Goal**: Implement comprehensive data validation and integrity features

#### Week 11: Validation and Constraints
**Deliverables**:
- ✅ Input validation system
- ✅ Business rule validation
- ✅ Relationship validation
- ✅ Data consistency checks
- ✅ Validation error handling

#### Week 12: Data Integrity Features
**Deliverables**:
- ✅ Soft delete implementation
- ✅ Cascade delete protection
- ✅ Referential integrity
- ✅ Data audit trail
- ✅ Integrity monitoring

## Key Design Patterns Observed

### 1. Repository Pattern
```typescript
// Consistent repository implementation
@Injectable()
export class TeamRepository extends Repository<TeamEntity> {
  constructor(
    @InjectRepository(TeamEntity)
    baseRepository: Repository<TeamEntity>
  ) {
    super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
  }
}
```

**File References**:
- [`team.repository.ts`](core/src/db/team/team.repository.ts#L7-14) - Team repository implementation
- [`franchise.repository.ts`](core/src/db/franchise/franchise.repository.ts#L8-13) - Franchise repository implementation
- [`club.repository.ts`](core/src/db/club/club.repository.ts#L7-14) - Club repository implementation
- [`user.repository.ts`](core/src/db/user/user.repository.ts#L8-13) - User repository implementation
- [`base.entity.ts`](core/src/db/base.entity.ts#L8-17) - Base entity that all repositories extend

### 2. GraphQL Resolver Pattern
```typescript
// Standard resolver structure
@Resolver(() => EntityObject)
export class EntityResolver {
  constructor(private readonly entityRepo: EntityRepository) {}

  @Query(() => EntityObject)
  async entity(@Args('id') id: string): Promise<EntityObject> {
    return this.entityRepo.findOneOrFail({ where: { id } });
  }
}
```

**File References**:
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L13-18) - Team resolver pattern
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts#L13-18) - Club resolver pattern
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts#L11-16) - Franchise resolver pattern
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L31-47) - User resolver with authorization
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts#L15-19) - Season resolver pattern

### 3. Authorization Pattern
```typescript
// Consistent authorization approach
@UsePermissions({
  resource: Resource.Entity,
  action: ResourceAction.Read,
  possession: AuthPossession.OWN,
})
```

**File References**:
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L31-37) - Authorization decorator usage
- [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) - RBAC guard implementation
- [`current-user.decorator.ts`](core/src/auth/current-user/current-user.decorator.ts) - Current user injection pattern
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts#L111) - Missing authorization (TODO comment)

### 4. Relationship Resolution Pattern
```typescript
// Efficient relationship loading
@ResolveField(() => RelatedObject)
async related(@Root() root: EntityObject) {
  if (root.related) return root.related;
  const entity = await this.entityRepo.findOne({
    where: { id: root.id },
    relations: ['related'],
  });
  return entity?.related;
}
```

**File References**:
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L32-40) - SkillGroup relationship resolution
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L42-50) - Team roles relationship resolution
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts#L52-60) - Roster spots relationship resolution
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts#L25-31) - Franchise relationship resolution
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts#L39-47) - Teams relationship resolution
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts#L23-31) - Clubs relationship resolution

### 5. Entity Definition Pattern
```typescript
// Consistent entity structure
@Entity()
export class Entity extends BaseEntity {
  @Column()
  name: string;
  
  @Column()
  slug: string;
  
  @Column()
  isActive: boolean;
  
  @ManyToOne(() => RelatedEntity)
  related: RelatedEntity;
}
```

**File References**:
- [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts#L15-30) - Franchise entity pattern
- [`club.entity.ts`](core/src/db/club/club.entity.ts#L15-30) - Club entity pattern
- [`team.entity.ts`](core/src/db/team/team.entity.ts#L15-35) - Team entity pattern
- [`base.entity.ts`](core/src/db/base.entity.ts#L8-17) - Base entity with common fields
- [`user.entity.ts`](core/src/db/user/user.entity.ts#L15-30) - User entity pattern

### 6. GraphQL Object Pattern
```typescript
// Consistent GraphQL object definition
@ObjectType()
export class EntityObject {
  @Field(() => ID)
  id: string;
  
  @Field()
  name: string;
  
  @Field(() => RelatedObject)
  related: RelatedObject;
}
```

**File References**:
- [`team.object.ts`](core/src/gql/team/team.object.ts) - Team GraphQL object
- [`club.object.ts`](core/src/gql/club/club.object.ts) - Club GraphQL object
- [`franchise.object.ts`](core/src/gql/franchise/franchise.object.ts) - Franchise GraphQL object
- [`user.object.ts`](core/src/gql/user/user.object.ts) - User GraphQL object
- [`schema.gql`](core/schema.gql) - Generated GraphQL schema (703 lines)

## Next Steps and Recommendations

### Immediate Actions (Week 1)
1. **Implement Franchise CRUD** - Start with [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts)
2. **Create Input Validation** - Establish validation patterns
3. **Add Authorization** - Implement proper permission checks
4. **Write Tests** - Establish testing standards

## Key File References

### Core Resolvers (Current Implementation)
- [`core_entities.resolver.ts`](core/src/gql/core_entities.resolver.ts) - Central read operations for 15+ entities
- [`user.resolver.ts`](core/src/gql/user/user.resolver.ts) - User management with partial CRUD
- [`team.resolver.ts`](core/src/gql/team/team.resolver.ts) - Team read operations only
- [`club.resolver.ts`](core/src/gql/club/club.resolver.ts) - Club read operations only
- [`franchise.resolver.ts`](core/src/gql/franchise/franchise.resolver.ts) - Franchise read operations only
- [`season.resolver.ts`](core/src/gql/season/season.resolver.ts) - Season read operations only

### Repository Layer (Data Access)
- [`franchise.repository.ts`](core/src/db/franchise/franchise.repository.ts) - Franchise data access
- [`club.repository.ts`](core/src/db/club/club.repository.ts) - Club data access
- [`team.repository.ts`](core/src/db/team/team.repository.ts) - Team data access
- [`user.repository.ts`](core/src/db/user/user.repository.ts) - User data access with search capabilities

### Entity Definitions (Data Model)
- [`franchise.entity.ts`](core/src/db/franchise/franchise.entity.ts) - Franchise entity definition
- [`club.entity.ts`](core/src/db/club/club.entity.ts) - Club entity definition
- [`team.entity.ts`](core/src/db/team/team.entity.ts) - Team entity definition
- [`user.entity.ts`](core/src/db/user/user.entity.ts) - User entity definition
- [`base.entity.ts`](core/src/db/base.entity.ts) - Base entity with common fields

### GraphQL Schema
- [`schema.gql`](core/schema.gql) - Complete GraphQL schema definition (703 lines)

### Authorization System
- [`rbac.guard.ts`](core/src/auth/guards/rbac.guard.ts) - Role-based access control
- [`current-user.decorator.ts`](core/src/auth/current-user/current-user.decorator.ts) - Current user injection

### Database Module
- [`db.module.ts`](core/src/db/db.module.ts) - Database configuration and imports
- [`internal.ts`](core/src/db/internal.ts) - Centralized entity and repository exports

### Short-term Goals (Month 1)
1. **Complete Core Entity CRUD** - Franchise, Club, Team, Season
2. **Implement Authorization System** - Full RBAC coverage
3. **Establish Error Handling** - Consistent error patterns
4. **Create Documentation** - API documentation and guides

### Medium-term Goals (Month 2-3)
1. **Advanced Query Features** - Filtering, search, pagination
2. **Bulk Operations** - Import/export, bulk updates
3. **Data Integrity** - Validation, soft delete, audit trails
4. **Performance Optimization** - Caching, indexing, query optimization

### Long-term Goals (Month 4+)
1. **Analytics and Reporting** - Advanced aggregation queries
2. **Data Migration Tools** - Legacy data import
3. **Monitoring and Alerting** - System health monitoring
4. **API Versioning** - Backward compatibility

### Development Guidelines

#### 1. Consistent Patterns
- Follow existing resolver patterns
- Use consistent naming conventions
- Implement proper error handling
- Add comprehensive tests

#### 2. Authorization First
- Always implement authorization
- Use resource-based permissions
- Test permission scenarios
- Audit permission changes

#### 3. Data Validation
- Validate all inputs
- Implement business rules
- Check relationships
- Handle edge cases

#### 4. Performance Considerations
- Use database indexes
- Implement pagination
- Optimize queries
- Cache frequently accessed data

### Risk Mitigation

#### 1. Authorization Risks
- **Risk**: Missing authorization checks
- **Mitigation**: Automated security scanning, permission audits

#### 2. Data Integrity Risks  
- **Risk**: Cascade delete issues
- **Mitigation**: Soft delete implementation, relationship validation

#### 3. Performance Risks
- **Risk**: N+1 query problems
- **Mitigation**: Query optimization, relationship preloading

#### 4. Scalability Risks
- **Risk**: Unbounded queries
- **Mitigation**: Pagination, query limits, caching

## Conclusion

The current CRUD implementation provides a solid foundation with consistent read operations but lacks the complete Create/Update/Delete functionality required for full data management. The 6-phase implementation roadmap addresses the critical gaps while maintaining system stability and security.

**Key Success Factors**:
1. **Consistent Implementation** - Follow established patterns
2. **Security First** - Implement proper authorization
3. **Quality Assurance** - Comprehensive testing
4. **Performance Focus** - Optimize for scale
5. **Documentation** - Maintain clear documentation

This roadmap provides a clear path to implementing a complete CRUD interface that will enable full data management capabilities across the Sprocket Core platform.