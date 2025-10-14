# Feature Spec: League Management UI

## Overview

Build a comprehensive UI for managing leagues, franchises, clubs, teams, and rosters. This is the primary interface for league operations, franchise managers, general managers, and team captains to manage their organizations.

## Current State

- Likely basic CRUD endpoints for entities
- No comprehensive UI for hierarchy management
- No roster management workflows
- Manual database operations for complex changes

## Target State

- Full-featured UI for managing the organizational hierarchy
- Roster management with drag-and-drop or similar UX
- Role assignment workflows (captains, managers)
- Season management
- Integration with RBAC system for permission checks
- Audit logging for all management actions

## Design Philosophy

Per our [design philosophy](./design-philosophy.md):
- **User-friendly**: Intuitive workflows that don't require training
- **Clear hierarchy**: Visual representation of League → Franchise → Club → Team → Player
- **Safe operations**: Confirmations for destructive actions; undo where possible
- **Efficient**: Bulk operations for common tasks (e.g., roster transfers)

---

## Entity Hierarchy

Based on your clarification:

```
League
  └─ Franchise (multiple clubs, each playing a different game)
       └─ Club (multiple teams in the same game)
            └─ Team (players in the same skill group, playing the same game)
                 └─ Player
```

### Key Properties

- **League**: Top-level organization (e.g., "Minor League Esports")
- **Franchise**: Multi-game organization (e.g., "Brooklyn Guardians")
- **Club**: Single-game organization within franchise (e.g., "Brooklyn Guardians Rocket League")
- **Team**: Skill-specific roster (e.g., "Brooklyn Guardians Pro")
- **Player**: Individual participant

### Relationships

- A **Franchise** can have multiple **Clubs** (one per game)
- A **Club** can have multiple **Teams** (one per skill group)
- A **Team** can have multiple **Players** (roster slots)
- A **Player** can be on multiple **Teams** (different games/skill groups)

---

## Data Model

### League

```typescript
@Entity()
class League {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // "Minor League Esports"

  @Column({ unique: true })
  slug: string; // "mle"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Franchise, franchise => franchise.league)
  franchises: Franchise[];

  @OneToMany(() => Season, season => season.league)
  seasons: Season[];
}
```

### Franchise

```typescript
@Entity()
class Franchise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => League)
  league: League;

  @Column()
  name: string; // "Brooklyn Guardians"

  @Column({ unique: true })
  slug: string; // "brooklyn-guardians"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  primaryColor: string; // Hex color for branding

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Club, club => club.franchise)
  clubs: Club[];

  @OneToMany(() => FranchiseRole, role => role.franchise)
  roles: FranchiseRole[]; // Franchise Managers
}
```

### Club

```typescript
@Entity()
class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Franchise)
  franchise: Franchise;

  @ManyToOne(() => Game)
  game: Game; // Rocket League, Trackmania, etc.

  @Column()
  name: string; // "Brooklyn Guardians Rocket League"

  @Column({ unique: true })
  slug: string; // "brooklyn-guardians-rocket-league"

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Team, team => team.club)
  teams: Team[];

  @OneToMany(() => ClubRole, role => role.club)
  roles: ClubRole[]; // General Managers
}
```

### Team

```typescript
@Entity()
class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Club)
  club: Club;

  @ManyToOne(() => SkillGroup)
  skillGroup: SkillGroup; // Pro, Master, Champion, etc.

  @Column()
  name: string; // "Brooklyn Guardians Pro"

  @Column({ unique: true })
  slug: string; // "brooklyn-guardians-pro"

  @Column({ type: 'int' })
  rosterSizeLimit: number; // Max players on roster

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => RosterSpot, spot => spot.team)
  rosterSpots: RosterSpot[];

  @OneToMany(() => TeamRole, role => role.team)
  roles: TeamRole[]; // Team Captains
}
```

### SkillGroup

```typescript
@Entity()
class SkillGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game)
  game: Game;

  @Column()
  name: string; // "Pro", "Master", "Champion"

  @Column({ type: 'int' })
  rank: number; // For ordering (1 = highest)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

### RosterSpot

Represents a player's position on a team's roster.

```typescript
@Entity()
class RosterSpot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team)
  team: Team;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Season, { nullable: true })
  season: Season; // Roster is per-season

  @Column({ type: 'enum', enum: RosterStatus })
  status: RosterStatus; // ACTIVE, INACTIVE, SUSPENDED

  @Column()
  joinedAt: Date;

  @Column({ nullable: true })
  leftAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Custom fields (jersey number, etc.)
}

enum RosterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

### RosterOffer

For offer-based roster management (players accept/decline offers).

```typescript
@Entity()
class RosterOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team)
  team: Team;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Season, { nullable: true })
  season: Season;

  @Column({ type: 'enum', enum: OfferStatus })
  status: OfferStatus; // PENDING, ACCEPTED, DECLINED, WITHDRAWN

  @ManyToOne(() => User)
  offeredBy: User; // Captain or GM who made offer

  @Column()
  offeredAt: Date;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ type: 'text', nullable: true })
  message: string; // Optional message from offeror
}

enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}
```

### Season

```typescript
@Entity()
class Season {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => League)
  league: League;

  @Column()
  name: string; // "Season 20", "Spring 2025"

  @Column({ type: 'int' })
  number: number; // Sequential numbering

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'enum', enum: SeasonStatus })
  status: SeasonStatus; // UPCOMING, ACTIVE, COMPLETED

  @Column({ type: 'boolean', default: false })
  isOffseason: boolean;
}

enum SeasonStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}
```

### Role Entities (for management positions)

```typescript
@Entity()
class FranchiseRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Franchise)
  franchise: Franchise;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: FranchiseRoleType })
  roleType: FranchiseRoleType; // MANAGER, ASSISTANT_MANAGER

  @Column()
  assignedAt: Date;

  @ManyToOne(() => User)
  assignedBy: User;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean; // True for Franchise Manager assignments
}

enum FranchiseRoleType {
  MANAGER = 'manager',
  ASSISTANT_MANAGER = 'assistant_manager',
}

@Entity()
class ClubRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Club)
  club: Club;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: ClubRoleType })
  roleType: ClubRoleType; // GENERAL_MANAGER, ASSISTANT_GM

  @Column()
  assignedAt: Date;

  @ManyToOne(() => User)
  assignedBy: User;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean; // True for GM assignments
}

enum ClubRoleType {
  GENERAL_MANAGER = 'general_manager',
  ASSISTANT_GM = 'assistant_gm',
}

@Entity()
class TeamRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team)
  team: Team;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: TeamRoleType })
  roleType: TeamRoleType; // CAPTAIN, ASSISTANT_CAPTAIN

  @Column()
  assignedAt: Date;

  @ManyToOne(() => User)
  assignedBy: User;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean; // False for Captain (immediate)
}

enum TeamRoleType {
  CAPTAIN = 'captain',
  ASSISTANT_CAPTAIN = 'assistant_captain',
}
```

---

## UI Features

### 1. Organizational Hierarchy View

**Visual Tree Structure**:
```
📁 Minor League Esports
  ├─ 🏢 Brooklyn Guardians
  │   ├─ 🎮 Rocket League
  │   │   ├─ ⭐ Pro Team
  │   │   ├─ ⭐ Master Team
  │   │   └─ ⭐ Champion Team
  │   └─ 🎮 Trackmania
  │       ├─ ⭐ Pro Team
  │       └─ ⭐ Master Team
  ├─ 🏢 Charlotte Cougars
  │   └─ 🎮 Rocket League
  │       └─ ⭐ Pro Team
  └─ ...
```

**Features**:
- Expandable/collapsible tree
- Click entity to view details
- Inline editing for names
- Drag-and-drop to reorganize (limited to valid moves)

### 2. Franchise Management

**Franchise Detail Page**:
```
+------------------------------------------+
| Brooklyn Guardians              [Edit]   |
+------------------------------------------+
| Logo: [image]                            |
| Primary Color: #1E3A8A                   |
| Description: [text]                      |
+------------------------------------------+
| Clubs:                                   |
|  - Rocket League (3 teams)    [Manage]   |
|  - Trackmania (2 teams)       [Manage]   |
|                               [+ Add Club]|
+------------------------------------------+
| Franchise Managers:                      |
|  - shuckle (since 2024-01-15) [Remove]   |
|                          [+ Assign Manager]|
+------------------------------------------+
```

**Actions**:
- Create/edit/delete clubs
- Assign/remove franchise managers (with approval workflow)
- Upload logo and set branding colors

### 3. Club Management

**Club Detail Page**:
```
+------------------------------------------+
| Brooklyn Guardians - Rocket League       |
+------------------------------------------+
| Game: Rocket League                      |
| Teams:                                   |
|  - Pro Team (6/8 players)     [Manage]   |
|  - Master Team (7/8 players)  [Manage]   |
|  - Champion Team (5/8 players)[Manage]   |
|                          [+ Create Team] |
+------------------------------------------+
| General Managers:                        |
|  - Nigel (since 2024-02-01)   [Remove]   |
|                          [+ Assign GM]   |
+------------------------------------------+
```

**Actions**:
- Create/edit/delete teams
- Assign/remove general managers (with approval workflow)
- View aggregate club stats

### 4. Team Management

**Team Detail Page**:
```
+------------------------------------------+
| Brooklyn Guardians Pro                   |
+------------------------------------------+
| Skill Group: Pro                         |
| Roster Limit: 8 players                  |
+------------------------------------------+
| Current Roster (6/8):                    |
|  - Player1 (active)           [Remove]   |
|  - Player2 (active)           [Remove]   |
|  - Player3 (inactive)         [Activate] |
|  ...                                     |
|                          [+ Add Player]  |
+------------------------------------------+
| Pending Offers (2):                      |
|  - Player4 (offered 2 days ago) [Withdraw]|
|  - Player5 (offered 1 week ago) [Withdraw]|
+------------------------------------------+
| Team Captains:                           |
|  - Player1 (since 2024-03-01) [Remove]   |
|                          [+ Assign Captain]|
+------------------------------------------+
```

**Actions**:
- Add/remove players from roster
- Make roster offers (if using offer system)
- Assign/remove team captains
- Set roster limits
- View team stats and match history

### 5. Roster Management

**Bulk Roster Operations**:
- **Search for players**: Filter by name, skill group, rostered status
- **Drag-and-drop**: Drag player from "Available Players" to team roster
- **Bulk actions**: Select multiple players, apply action (transfer, remove, etc.)

**Offer System**:
1. Captain clicks "Add Player"
2. Search for player (filters: unrostered, correct skill group)
3. Click "Make Offer"
4. Optional: Add message
5. Offer sent to player
6. Player sees notification, accepts/declines
7. If accepted, player added to roster

**Direct Assignment** (League Ops/Admin):
- Bypass offer system
- Directly assign player to roster
- Used for administrative actions

### 6. Season Management

**Season List**:
```
+------------------------------------------+
| Seasons                      [+ Create]  |
+------------------------------------------+
| Name       | Status   | Dates           | Actions  |
+------------------------------------------+
| Season 20  | Active   | 2024-09-01 to...| [Edit][End] |
| Season 19  | Completed| 2024-03-01 to...| [View]      |
+------------------------------------------+
```

**Season Creation Flow**:
1. Set season name and number
2. Set start/end dates
3. Mark as active (only one active season per league at a time)
4. Create season

**Offseason Mode**:
- Toggle offseason (allows roster changes without active season)
- Used for drafts, trades, etc.

---

## Roster Management Rules

### Validation Rules

**Roster Spot**:
- Player can only be on one team per club (can't be on Pro and Master teams in same club)
- Player can be on multiple teams across different clubs/games
- Team cannot exceed roster size limit

**Roster Offers**:
- Only one pending offer per player per team at a time
- Offers can be withdrawn before acceptance
- Accepted offers automatically create roster spot

### Permission-Based Actions

Based on RBAC roles (see [RBAC feature spec](./feature-rbac-system.md)):

| Action | Player | Captain | General Manager | Franchise Manager | League Ops | Admin |
|--------|--------|---------|-----------------|-------------------|------------|-------|
| View roster | Own team | Own team | Own club | Own franchise | All | All |
| Make roster offer | ❌ | Own team | Own club | Own franchise | All | All |
| Accept roster offer | Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Remove from roster | ❌ | Own team | Own club | Own franchise | All | All |
| Assign captain | ❌ | ❌ | Own club | Own franchise | All | All |
| Assign GM | ❌ | ❌ | ❌ | Own franchise | Approve | Approve |
| Assign Franchise Manager | ❌ | ❌ | ❌ | ❌ | Approve | Approve |

### Approval Workflows

Per your requirements, the following actions require approval:

- **Assigning League Ops or Admin**: Always requires admin approval
- **Assigning Franchise Manager**: Requires League Ops or Admin approval
- **Assigning General Manager**: Requires League Ops or Admin approval

**Workflow**:
1. User assigns role (e.g., GM to a user)
2. Role assignment created with `requiresApproval = true`, `status = PENDING`
3. Notification sent to approvers
4. Approver reviews and approves/rejects
5. If approved, role becomes active and RBAC policies are applied

All other actions (roster changes, captain assignments) are immediate (assuming RBAC permissions).

---

## API Endpoints

### Franchise Management

- `GET /api/franchises` - List all franchises
- `POST /api/franchises` - Create a new franchise (League Ops/Admin)
- `GET /api/franchises/:id` - Get franchise details
- `PUT /api/franchises/:id` - Update franchise
- `DELETE /api/franchises/:id` - Soft-delete franchise

### Club Management

- `GET /api/clubs` - List all clubs (filter by franchise, game)
- `POST /api/clubs` - Create a new club (Franchise Manager+)
- `GET /api/clubs/:id` - Get club details
- `PUT /api/clubs/:id` - Update club
- `DELETE /api/clubs/:id` - Soft-delete club

### Team Management

- `GET /api/teams` - List all teams (filter by club, skill group)
- `POST /api/teams` - Create a new team (GM+)
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Soft-delete team

### Roster Management

- `GET /api/teams/:id/roster` - Get team roster
- `POST /api/teams/:id/roster` - Add player to roster (direct assignment or offer)
- `DELETE /api/teams/:id/roster/:spotId` - Remove player from roster
- `PUT /api/teams/:id/roster/:spotId` - Update roster spot (e.g., activate/deactivate)

### Roster Offers

- `GET /api/roster-offers` - List offers (filter by team, player, status)
- `POST /api/roster-offers` - Create roster offer
- `PUT /api/roster-offers/:id` - Accept/decline offer (player) or withdraw (captain)
- `DELETE /api/roster-offers/:id` - Withdraw offer

### Role Management

- `GET /api/franchises/:id/roles` - Get franchise managers
- `POST /api/franchises/:id/roles` - Assign franchise manager (with approval)
- `DELETE /api/franchise-roles/:id` - Remove franchise manager
- (Similar endpoints for club roles and team roles)

### Season Management

- `GET /api/seasons` - List seasons
- `POST /api/seasons` - Create season (League Ops/Admin)
- `PUT /api/seasons/:id` - Update season
- `PUT /api/seasons/:id/activate` - Set season as active

---

## Tasks Breakdown

### Database Schema
- [ ] Create `League` entity and migration
- [ ] Create `Franchise` entity and migration
- [ ] Create `Club` entity and migration
- [ ] Create `Team` entity and migration
- [ ] Create `SkillGroup` entity and migration
- [ ] Create `RosterSpot` entity and migration
- [ ] Create `RosterOffer` entity and migration
- [ ] Create `Season` entity and migration
- [ ] Create `FranchiseRole`, `ClubRole`, `TeamRole` entities and migrations
- [ ] Add indexes for common queries

### Backend Services
- [ ] Implement franchise CRUD service
- [ ] Implement club CRUD service
- [ ] Implement team CRUD service
- [ ] Implement roster management service (add, remove, validate)
- [ ] Implement roster offer service (create, accept, decline, withdraw)
- [ ] Implement role assignment service (with approval workflow)
- [ ] Implement season management service
- [ ] Add RBAC permission checks to all endpoints

### UI Components
- [ ] Organizational hierarchy tree view
- [ ] Franchise detail page and edit form
- [ ] Club detail page and edit form
- [ ] Team detail page and edit form
- [ ] Roster management interface (list, add, remove)
- [ ] Roster offer interface (create, view pending, accept/decline)
- [ ] Role assignment interface (assign, remove, approve)
- [ ] Season management interface (list, create, activate)

### Validation & Business Logic
- [ ] Validate roster size limits
- [ ] Prevent duplicate roster spots (same player, same club)
- [ ] Validate skill group matching for roster adds
- [ ] Implement approval workflow for role assignments
- [ ] Validate season dates (no overlapping active seasons)

### Integration
- [ ] Integrate with RBAC system for permission checks
- [ ] Trigger notifications for roster offers
- [ ] Trigger notifications for role assignment approvals
- [ ] Audit logging for all management actions

### Testing
- [ ] Unit tests for roster validation logic
- [ ] Unit tests for approval workflow
- [ ] Integration tests for roster management flows
- [ ] Integration tests for role assignment flows
- [ ] E2E tests for full roster management workflow
- [ ] E2E tests for season management

### Documentation
- [ ] User guide for franchise/club/team management
- [ ] User guide for roster management
- [ ] User guide for role assignments
- [ ] API documentation for all endpoints
- [ ] Admin guide for league setup and configuration

---

## Open Questions & Design Decisions

### 1. Player Multi-Rostering

**Question**: Can a player be on rosters for multiple teams across different games simultaneously?

**Answer** (from your clarification): Yes, a player can be on multiple teams as long as they're in different clubs/games.

**Implementation**: Unique constraint on `(player_id, club_id)` to prevent same player on multiple teams in same club.

### 2. Roster Transfers

**Question**: How do player transfers between teams work?

**Options**:
- A) Remove from Team A, add to Team B (two separate actions)
- B) Transfer action (atomic move)
- C) Trade system (swap players between teams)

**Recommendation**: Start with **Option A** (separate actions). Add transfer/trade system later if needed.

### 3. Historical Rosters

**Question**: Do we need to track historical rosters (who was on team during a specific season)?

**Answer**: Yes, rosters are per-season (see `RosterSpot.season` FK).

**Implementation**: Query rosters filtered by season to show historical data.

### 4. Inactive Rosters

**Question**: What does "inactive" roster status mean?

**Recommendation**: Inactive = player is rostered but not eligible to play (injury, suspension, etc.). Still counts toward roster limit.

### 5. Franchise/Club Naming

**Question**: Should franchise name automatically propagate to clubs (e.g., "Brooklyn Guardians Rocket League")?

**Recommendation**: Yes, but allow manual override. Provide a naming template (e.g., `{franchise} {game}`).

---

## Success Criteria

- [ ] Can create and manage full organizational hierarchy (League → Franchise → Club → Team)
- [ ] Can add/remove players from rosters with validation
- [ ] Roster offers can be created, accepted, and declined
- [ ] Role assignments work with approval workflow
- [ ] RBAC permissions are enforced for all actions
- [ ] UI is intuitive and requires minimal training
- [ ] Season management allows active/offseason modes
- [ ] Audit logs track all management actions

---

## Performance Considerations

### Hierarchy Queries

- Fetching full hierarchy (League → Teams → Players) can be expensive
- Use lazy loading or pagination for large franchises
- Consider materialized paths or nested sets for efficient tree queries

### Roster Lookups

- Index `(team_id, season_id)` for fast roster retrieval
- Index `(player_id, club_id)` for multi-roster validation

### Offer Queries

- Index `(player_id, status)` for pending offer lookups
- Index `(team_id, status)` for team's pending offers

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Roster limit violations | Server-side validation before accepting offers/adding players |
| Conflicting role assignments | Approval workflow; unique constraints on roles |
| UI becomes overwhelming for large franchises | Pagination; collapsible sections; search/filter |
| Accidental roster changes | Confirmations for destructive actions; audit logs for rollback |
| Performance with deep hierarchies | Optimize queries; use caching; lazy load branches |

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

- **Player Trading**: Swap players between teams with approval
- **Draft System**: Annual draft for new players
- **Roster Locks**: Freeze rosters during playoffs
- **Free Agency**: Players can apply to teams
- **Salary Cap** (if applicable): Track player "salaries" and enforce cap limits

---

## Related Documents

- [Roadmap](./roadmap.md)
- [RBAC System](./feature-rbac-system.md) (permissions for management actions)
- [Multi-Game Data Model](./feature-multi-game-data-model.md) (match/team data)
- [Design Philosophy](./design-philosophy.md)
