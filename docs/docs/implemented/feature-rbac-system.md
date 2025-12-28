# Feature Spec: RBAC System Enhancement

## Overview

Build out a comprehensive Role-Based Access Control (RBAC) system with an administrative UI for managing roles, permissions, and user/group assignments. The system uses Casbin for flexible policy enforcement.

## Current State

## Current State

- **Architecture**: Unified V2 Monolith (PostgreSQL-ready).
- **Authorization**: Casbin integration complete with PostgreSQL adapter.
- **Policies**: Database-backed and managed via Admin UI.
- **Management**: Full Admin UI implemented.

## Target State

- ✅ Casbin-based RBAC system with PostgreSQL storage
- ✅ Admin UI for:
  - Creating, editing, and deleting roles
  - Assigning permissions to roles
  - Assigning roles to users and groups
  - Viewing and testing policies
- ✅ Database-backed policies (editable via UI)
- ✅ Comprehensive policy examples for all v2 features
- ✅ Audit logging for permission changes

## Design Philosophy

Per our [design philosophy](../design-philosophy.md):

- **Simplicity**: Avoid over-complicating the permission model; start with minimal viable roles
- **Database-first**: Store policies in PostgreSQL for UI editability
- **Clear boundaries**: Separate policy definition from enforcement
- **Developer-friendly**: Provide clear examples and tooling for policy testing

---

## Casbin Model

### Current Model (from authz-noodles.md)

```conf
[request_definition]
r = subject, object, action, scope

[policy_definition]
p = subject, object, action, scope, effect

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.effect == allow)) && !some(where (p.effect == deny))

[matchers]
m = r.object == p.object && r.action == p.action && g(r.subject, p.subject) && r.scope == p.scope
```

### Proposed Enhancements

**Default-deny**: Everything is denied by default unless explicitly allowed
**Scope-based permissions**: Use scopes to limit actions to specific contexts (e.g., `own_team`, `own_franchise`)
**Hierarchical roles**: Support role inheritance (e.g., `admin` inherits from `league_ops`)

---

## Roles & Permissions

### Minimal Viable Roles (MVP)

Based on your requirements:

1. **Player**: Standard user, can participate in matches/scrims, manage own profile
2. **Captain**: Team captain, can manage own team's roster and schedule
3. **General Manager**: Manages a Club (multiple teams in same game), can manage all teams in club
4. **Franchise Manager**: Manages a Franchise (multiple clubs), can manage all clubs in franchise
5. **League Ops**: League operations staff, can manage fixtures, submissions, and schedules
6. **Admin**: Full system access, can manage all resources and permissions

### Role Hierarchy

```
Admin
  └─ League Ops
       └─ Franchise Manager
            └─ General Manager
                 └─ Captain
                      └─ Player
```

**Inheritance**: Higher roles inherit permissions from lower roles (e.g., Admin can do everything League Ops can do).

---

## Data Model

### CasbinRule (Casbin Adapter)

Casbin provides a TypeORM adapter that stores policies in a table:

```typescript
@Entity()
class CasbinRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ptype: string; // 'p' for policy, 'g' for role

  @Column({ nullable: true })
  v0: string; // subject (user ID or role name)

  @Column({ nullable: true })
  v1: string; // object (resource type)

  @Column({ nullable: true })
  v2: string; // action (read, write, manage, etc.)

  @Column({ nullable: true })
  v3: string; // scope (own, own_team, own_franchise, all)

  @Column({ nullable: true })
  v4: string; // effect (allow, deny)

  @Column({ nullable: true })
  v5: string; // reserved for future use
}
```

**Note**: Casbin's default schema is generic. For better UX, we'll wrap this with a service layer that provides typed access.

### RoleDefinition (UI Metadata)

For admin UI purposes, we'll create a metadata table to describe roles:

```typescript
@Entity()
class RoleDefinition {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string; // 'player', 'captain', 'general_manager', etc.

  @Column()
  displayName: string; // 'Team Captain', 'General Manager', etc.

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int", default: 0 })
  hierarchy: number; // For role inheritance (higher = more permissions)

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>; // UI hints, icons, etc.
}
```

### UserRole (User → Role Assignment)

```typescript
@Entity()
class UserRole {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => RoleDefinition)
  role: RoleDefinition;

  @Column({ nullable: true })
  scope: string; // e.g., 'franchise:123', 'team:456' for scoped roles

  @Column()
  assignedAt: Date;

  @ManyToOne(() => User)
  assignedBy: User;

  @Column({ nullable: true })
  expiresAt: Date; // Optional: for temporary role assignments

  @Column({ type: "boolean", default: false })
  requiresApproval: boolean; // For Franchise Manager, General Manager, League Ops, Admin
}
```

### PermissionAuditLog

Track all permission changes for accountability:

```typescript
@Entity()
class PermissionAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  actor: User; // Who made the change

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction; // GRANT_ROLE, REVOKE_ROLE, ADD_POLICY, REMOVE_POLICY

  @Column({ type: "jsonb" })
  details: Record<string, any>; // What changed

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  reason: string; // Optional justification
}

enum AuditAction {
  GRANT_ROLE = "grant_role",
  REVOKE_ROLE = "revoke_role",
  ADD_POLICY = "add_policy",
  REMOVE_POLICY = "remove_policy",
  APPROVE_ROLE = "approve_role",
  REJECT_ROLE = "reject_role",
}
```

---

## Scopes

Scopes limit the context in which an action can be performed.

### Scope Types

- `own`: User's own resources (e.g., own profile, own schedule)
- `own_team`: Resources belonging to user's team
- `own_club`: Resources belonging to user's club
- `own_franchise`: Resources belonging to user's franchise
- `all`: All resources (admin/league ops)

### Dynamic Scope Resolution

The application code must resolve scopes dynamically. For example:

```typescript
async canManageRoster(userId: string, teamId: string): Promise<boolean> {
  const user = await this.userRepo.findOne(userId, { relations: ['roles'] });

  // Determine scope
  let scope: string;
  if (user.teamId === teamId) {
    scope = 'own_team';
  } else if (user.clubId === await this.getTeamClub(teamId)) {
    scope = 'own_club';
  } else if (user.franchiseId === await this.getTeamFranchise(teamId)) {
    scope = 'own_franchise';
  } else {
    scope = 'all';
  }

  // Check permission
  return this.casbinService.enforce(userId, 'roster', 'manage', scope);
}
```

---

## Policy Examples

### Default Policies (Seeded at Installation)

```conf
# Player role
p, player, profile, read, own, allow
p, player, profile, write, own, allow
p, player, schedule, read, own, allow
p, player, schedule, write, own, allow
p, player, scrim, participate, own_skill_group, allow
p, player, scrim, read, own_skill_group, allow

# Captain role
p, captain, roster, read, own_team, allow
p, captain, roster, manage, own_team, allow
p, captain, schedule, read, own_team, allow
p, captain, submission, create, own_team, allow
p, captain, submission, ratify, own_team, allow

# General Manager role
p, general_manager, roster, read, own_club, allow
p, general_manager, roster, manage, own_club, allow
p, general_manager, schedule, read, own_club, allow
p, general_manager, team, create, own_club, allow
p, general_manager, team, delete, own_club, allow

# Franchise Manager role
p, franchise_manager, roster, read, own_franchise, allow
p, franchise_manager, roster, manage, own_franchise, allow
p, franchise_manager, club, create, own_franchise, allow
p, franchise_manager, club, delete, own_franchise, allow

# League Ops role
p, league_ops, fixture, create, all, allow
p, league_ops, fixture, delete, all, allow
p, league_ops, submission, reset, all, allow
p, league_ops, schedule, read, all, allow
p, league_ops, scrim, read, all, allow

# Admin role
p, admin, *, *, all, allow # Wildcard: can do anything
```

### Role Inheritance

```conf
# Role hierarchy (using Casbin's role definition)
g, admin, league_ops
g, league_ops, franchise_manager
g, franchise_manager, general_manager
g, general_manager, captain
g, captain, player
```

---

## Admin UI

### Features

#### 1. Role Management

- List all roles with metadata (name, description, hierarchy)
- Create new roles (custom roles beyond MVP set)
- Edit role metadata (display name, description)
- Deactivate roles (soft delete)

#### 2. Permission Assignment

- View all permissions for a role
- Add permissions to a role (resource, action, scope)
- Remove permissions from a role
- Bulk import/export policies (CSV or JSON)

#### 3. User Role Assignment

- Search for users
- View user's current roles
- Assign role to user (with optional scope and expiration)
- Revoke role from user
- Approve/reject pending role assignments (for Franchise Manager, GM, League Ops, Admin)

#### 4. Policy Testing

- Simulate permission checks (user, resource, action, scope)
- Show which policies allow/deny the action
- Helpful for debugging policy conflicts

#### 5. Audit Log Viewer

- View all permission changes
- Filter by actor, action type, date range
- Export audit logs for compliance

### UI Mockups (Wireframes)

**Role Management Screen**:

```
+------------------------------------------+
| Roles                          [+ New]   |
+------------------------------------------+
| Name              | Hierarchy | Actions  |
+------------------------------------------+
| Player            | 0         | [Edit]   |
| Captain           | 1         | [Edit]   |
| General Manager   | 2         | [Edit]   |
| Franchise Manager | 3         | [Edit]   |
| League Ops        | 4         | [Edit]   |
| Admin             | 5         | [Edit]   |
+------------------------------------------+
```

**Permission Assignment Screen** (for a role):

```
+------------------------------------------+
| Permissions for: Captain      [+ Add]    |
+------------------------------------------+
| Resource | Action  | Scope     | Effect  | Actions |
+------------------------------------------+
| roster   | read    | own_team  | allow   | [Remove] |
| roster   | manage  | own_team  | allow   | [Remove] |
| schedule | read    | own_team  | allow   | [Remove] |
+------------------------------------------+
```

**User Role Assignment Screen**:

```
+------------------------------------------+
| User: shuckle                             |
+------------------------------------------+
| Role               | Scope          | Actions       |
+------------------------------------------+
| Franchise Manager  | franchise:123  | [Revoke]      |
| Player             | -              | [Revoke]      |
+------------------------------------------+
| [+ Assign New Role]                      |
+------------------------------------------+
```

---

## Approval Workflow

Certain role assignments require approval (Franchise Manager, General Manager, League Ops, Admin).

### Workflow

1. User requests role assignment (or admin assigns pending approval)
2. `UserRole` entry created with `requiresApproval = true`, `status = PENDING`
3. Notification sent to approvers (e.g., current admins)
4. Approver reviews request and approves/rejects
5. If approved, role becomes active; if rejected, entry is deleted or marked rejected

### Schema Addition

```typescript
@Entity()
class UserRole {
  // ... existing fields

  @Column({
    type: "enum",
    enum: RoleAssignmentStatus,
    default: RoleAssignmentStatus.ACTIVE,
  })
  status: RoleAssignmentStatus; // PENDING, ACTIVE, REJECTED
}

enum RoleAssignmentStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REJECTED = "rejected",
}
```

---

## API Endpoints

### Role Management

- `GET /admin/roles` - List all roles
- `POST /admin/roles` - Create a new role
- `PUT /admin/roles/:id` - Update role metadata
- `DELETE /admin/roles/:id` - Deactivate a role

### Permission Management

- `GET /admin/roles/:id/permissions` - Get permissions for a role
- `POST /admin/roles/:id/permissions` - Add permission to role
- `DELETE /admin/permissions/:id` - Remove permission

### User Role Assignment

- `GET /admin/users/:id/roles` - Get user's roles
- `POST /admin/users/:id/roles` - Assign role to user
- `DELETE /admin/user-roles/:id` - Revoke role from user
- `POST /admin/user-roles/:id/approve` - Approve pending role assignment
- `POST /admin/user-roles/:id/reject` - Reject pending role assignment

### Policy Testing

- `POST /admin/permissions/test` - Test a permission check (body: `{ userId, resource, action, scope }`)

### Audit Logs

- `GET /admin/audit-logs` - Get audit logs (with filters)

---

## Tasks Breakdown

### Database Schema

- [x] Set up Casbin TypeORM adapter (`CasbinRule` table)
- [x] Create `RoleDefinition` entity and migration
- [x] Create `UserRole` entity and migration
- [x] Create `PermissionAuditLog` entity and migration
- [x] Seed default roles (Player, Captain, GM, FM, League Ops, Admin)
- [x] Seed default policies for each role

### Backend Services

- [x] Implement `RbacService` wrapping Casbin enforcer
- [x] Implement role management CRUD (create, read, update, delete roles)
- [x] Implement permission management (add, remove permissions for roles)
- [x] Implement user role assignment (assign, revoke roles)
- [x] Implement approval workflow for sensitive roles
- [x] Implement audit logging for all permission changes
- [x] Implement policy testing endpoint

### Admin UI

- [x] Create role management UI (list, create, edit roles)
- [x] Create permission assignment UI (view, add, remove permissions)
- [x] Create user role assignment UI (search users, assign/revoke roles)
- [x] Create approval workflow UI (pending assignments, approve/reject)
- [x] Create policy testing UI (simulate permission checks)
- [x] Create audit log viewer UI

### Integration

- [x] Add RBAC guards to all API endpoints
- [x] Implement scope resolution logic for dynamic scopes
- [x] Add permission checks to roster management endpoints
- [x] Add permission checks to schedule management endpoints
- [x] Add permission checks to scrim endpoints
- [x] Add permission checks to submission endpoints

### Testing

- [x] Unit tests for Casbin policy enforcement
- [x] Unit tests for scope resolution logic
- [x] Integration tests for role assignment workflow
- [x] Integration tests for approval workflow
- [x] E2E tests for admin UI flows
- [x] Security tests for privilege escalation

### Documentation

- [x] Document all roles and their permissions
- [x] Document scope types and resolution logic
- [x] API documentation for RBAC endpoints
- [x] Admin guide for managing roles and permissions
- [x] Examples of common policy scenarios

---

## Open Questions & Design Decisions

### 1. Group-based Role Assignment

**Question**: Should we support assigning roles to groups (e.g., all members of a team get Captain role)?

**Options**:

- A) Individual assignment only (simpler)
- B) Support groups with automatic role propagation

**Recommendation**: Start with **individual assignment** for MVP. Add group support later if needed.

### 2. Policy Storage

**Question**: Store policies in database or config files?

**Decision**: **Database** (as per your requirements), using Casbin's TypeORM adapter. This allows UI-based editing.

### 3. Wildcard Permissions

**Question**: Should Admin role have wildcard permissions (`*`), or explicit grants?

**Recommendation**: Use wildcard for Admin to simplify policy management. Casbin supports this natively.

### 4. Permission Caching

**Question**: Should we cache permission checks for performance?

**Options**:

- A) No caching (always query Casbin)
- B) Cache with TTL (e.g., 5 minutes)
- C) Cache with invalidation on policy change

**Recommendation**: Start with **no caching**. Add caching if performance becomes an issue (Casbin is quite fast).

### 5. Custom Roles

**Question**: Should admins be able to create fully custom roles, or only assign existing roles?

**Recommendation**: Allow **custom roles** via UI, but provide sensible defaults. This gives flexibility without over-complicating initial setup.

---

## Success Criteria

## Success Criteria

- [x] All MVP roles are defined and seeded
- [x] Admin UI allows creating and editing roles
- [x] Admin UI allows assigning permissions to roles
- [x] Admin UI allows assigning roles to users
- [x] Approval workflow functions for sensitive roles
- [x] All API endpoints are protected by RBAC guards
- [x] Permission checks complete in <50ms
- [x] Audit logs capture all permission changes
- [x] Documentation includes examples for all common scenarios

---

## Performance Considerations

### Casbin Performance

- Casbin is very fast for policy enforcement (microseconds per check)
- Batch policy checks if validating multiple permissions at once
- Use in-memory enforcer (loaded from database on startup, synced periodically)

### Database Indexes

```sql
CREATE INDEX idx_casbin_rule_ptype ON casbin_rule(ptype);
CREATE INDEX idx_casbin_rule_subject ON casbin_rule(v0);
CREATE INDEX idx_user_role_user ON user_role(user_id);
CREATE INDEX idx_user_role_role ON user_role(role_id);
```

---

## Risks & Mitigations

| Risk                                       | Mitigation                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| Policy conflicts (allow vs deny)           | Default-deny; use Casbin's effect resolution; policy testing UI              |
| Privilege escalation                       | Audit logging; approval workflow for sensitive roles; security testing       |
| Scope resolution bugs                      | Comprehensive unit tests; integration tests for all scope types              |
| Performance degradation with many policies | Casbin caching; optimize policy count; use role inheritance                  |
| Admin accidentally locks themselves out    | Always maintain a root admin account; policy testing before applying changes |

---

## Related Documents

- [Roadmap](../roadmap.md)
- [RBAC Musings (authz-noodles.md)](../authz-noodles.md)
- [League Management UI](../feature-league-management.md) (depends on RBAC)
- [Design Philosophy](../design-philosophy.md)
