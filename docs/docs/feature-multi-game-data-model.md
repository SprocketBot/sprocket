# Feature Spec: Multi-Game Data Model Refactor

## Overview

Refactor the current Rocket League-centric data model to support multiple game types with fundamentally different match structures, starting with Trackmania, with consideration for future games like Apex Legends and Valorant.

## Current State

The existing data model is tightly coupled to Rocket League's team-vs-team, single-winner match structure:
- One winning team, one losing team per match
- Individual player stats: goals, assists, saves, etc.
- Match consists of games/rounds with consistent structure

## Target State

A flexible data model that can accommodate:

**Rocket League**: Team vs team, single winner, individual performance stats
**Trackmania**: Team vs team, multiple runs across multiple maps, points-based finishing order
**Future (Apex/Valorant)**: Battle royale or tactical shooter structures

## Design Philosophy

Per our [design philosophy](./design-philosophy.md), we want to:
- Keep the model as simple as possible while supporting known requirements
- Use PostgreSQL constraints and relationships to enforce data integrity
- Avoid over-abstraction for hypothetical future games
- Design for RL and Trackmania today, with extensibility points for tomorrow

---

## Data Model Design

### Core Abstractions

#### Match
The top-level container for a competitive event between teams.

```typescript
@Entity()
class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game)
  game: Game; // Which game is being played

  @ManyToOne(() => MatchType)
  matchType: MatchType; // Regular season, playoff, scrim, etc.

  @Column()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'enum', enum: MatchStatus })
  status: MatchStatus; // SCHEDULED, IN_PROGRESS, COMPLETED, INVALIDATED

  @OneToMany(() => Round, round => round.match)
  rounds: Round[];

  @OneToMany(() => MatchTeam, mt => mt.match)
  matchTeams: MatchTeam[];

  @OneToMany(() => MatchPlayer, mp => mp.match)
  matchPlayers: MatchPlayer[];

  @Column({ type: 'jsonb', nullable: true })
  gameSpecificMetadata: Record<string, any>; // Escape hatch for game-specific data
}
```

#### Round
A single round/game/run within a match. Structure varies by game.

```typescript
@Entity()
class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match)
  match: Match;

  @Column()
  roundNumber: number; // Sequential ordering within match

  @Column({ nullable: true })
  mapName: string; // For games with map selection

  @Column()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @OneToMany(() => RoundResult, rr => rr.round)
  results: RoundResult[]; // Flexible result structure per game

  @Column({ type: 'jsonb', nullable: true })
  gameSpecificMetadata: Record<string, any>; // Escape hatch
}
```

#### RoundResult
The outcome for a team or player in a specific round. Game-agnostic structure.

```typescript
@Entity()
class RoundResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Round)
  round: Round;

  @ManyToOne(() => Team, { nullable: true })
  team: Team; // For team-based results

  @ManyToOne(() => Player, { nullable: true })
  player: Player; // For individual results (e.g., Trackmania finish order)

  @Column({ type: 'int', nullable: true })
  score: number; // Generic score/points for this round

  @Column({ type: 'int', nullable: true })
  placement: number; // Finishing position (1st, 2nd, etc.)

  @Column({ type: 'boolean', default: false })
  isWinner: boolean; // For games with clear round winners

  @Column({ type: 'jsonb', nullable: true })
  stats: Record<string, any>; // Game-specific stats as JSON

  @Column({ type: 'jsonb', nullable: true })
  gameSpecificMetadata: Record<string, any>;
}
```

#### MatchTeam
Represents a team's participation in a match (aggregate level).

```typescript
@Entity()
class MatchTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match)
  match: Match;

  @ManyToOne(() => Team)
  team: Team;

  @Column({ type: 'int', default: 0 })
  totalScore: number; // Aggregate score across all rounds

  @Column({ type: 'boolean', default: false })
  isWinner: boolean;

  @Column({ type: 'jsonb', nullable: true })
  aggregateStats: Record<string, any>; // Sum of player stats, etc.
}
```

#### MatchPlayer
Represents a player's participation in a match.

```typescript
@Entity()
class MatchPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match)
  match: Match;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Team)
  team: Team; // Which team they played for

  @Column({ type: 'jsonb', nullable: true })
  aggregateStats: Record<string, any>; // Sum across all rounds
}
```

#### Game
Represents a game type (RL, Trackmania, etc.)

```typescript
@Entity()
class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // "Rocket League", "Trackmania", etc.

  @Column({ unique: true })
  slug: string; // "rocket-league", "trackmania"

  @Column({ type: 'jsonb' })
  config: GameConfig; // Game-specific configuration

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

interface GameConfig {
  scoringSystem: 'winner-loser' | 'points-based' | 'placement-based';
  supportsRounds: boolean;
  roundScoring?: 'placement' | 'score' | 'winner-takes-all';
  statDefinitions: StatDefinition[];
  // ... other game-specific config
}

interface StatDefinition {
  key: string; // "goals", "assists", "finishTime"
  displayName: string;
  type: 'integer' | 'float' | 'duration';
  aggregation: 'sum' | 'avg' | 'max' | 'min';
}
```

---

## Game-Specific Examples

### Rocket League Match Flow

1. **Match created**: `game = "Rocket League"`, `matchType = "Regular Season"`
2. **Rounds created**: Best of 5 series → up to 5 rounds
3. **Round results**: Each round has a winner (team-level)
   - RoundResult for Team A: `score = 3, isWinner = true`
   - RoundResult for Team B: `score = 1, isWinner = false`
4. **Player stats**: Stored in RoundResult.stats as JSON
   ```json
   {
     "goals": 2,
     "assists": 1,
     "saves": 4,
     "shots": 8
   }
   ```
5. **Match winner**: First team to win 3 rounds → MatchTeam.isWinner = true

### Trackmania Match Flow

1. **Match created**: `game = "Trackmania"`, `matchType = "Regular Season"`
2. **Rounds created**: Multiple runs across multiple maps (e.g., 3 maps × 2 runs = 6 rounds)
3. **Round results**: Each round has placement-based results (player-level)
   - RoundResult for Player 1: `placement = 1, score = 10` (10 points for 1st)
   - RoundResult for Player 2: `placement = 2, score = 8` (8 points for 2nd)
   - RoundResult for Player 3: `placement = 3, score = 6` (6 points for 3rd)
   - ... etc.
4. **Player stats**: Finish times stored in stats
   ```json
   {
     "finishTime": 45.234,
     "checkpoints": [10.1, 20.5, 30.2, 45.234],
     "respawns": 0
   }
   ```
5. **Team scoring**: MatchTeam.totalScore = sum of all team members' points across all rounds
6. **Match winner**: Team with highest total score

---

## Migration Strategy

### Phase 1: Schema Design & Migration
- Define new entities and relationships
- Create TypeORM migrations
- **No v1 data migration** (clean break acceptable)
- Set up seed data for testing

### Phase 2: Game Configuration
- Define Rocket League game config with stat definitions
- Define Trackmania game config
- Create admin tooling to manage game configs (or start with config files)

### Phase 3: API Updates
- Update match creation/submission endpoints
- Add game-specific validation logic
- Update queries to handle new structure

### Phase 4: Frontend Updates
- Update match display components to handle multiple games
- Create game-specific stat displays
- Update scoreboards and leaderboards

---

## Open Questions & Design Decisions

### 1. Player vs Team Stats
**Question**: Should RoundResult always point to either a team OR a player, or can it point to both?

**Proposal**: Use nullable foreign keys—point to team for team-level results (RL), player for individual results (Trackmania placement), or both when needed.

### 2. Stat Validation
**Question**: How do we validate game-specific stats in the `stats` JSONB field?

**Options**:
- A) JSON Schema validation at application layer
- B) TypeScript discriminated unions per game
- C) Separate tables per game (violates simplicity principle)

**Recommendation**: Option A with Zod schemas per game, validated before persistence.

### 3. Points Calculation
**Question**: Where should point assignment logic live (e.g., 1st = 10pts, 2nd = 8pts)?

**Options**:
- A) Game config (declarative mapping)
- B) Game-specific service classes (imperative)

**Recommendation**: Start with game config for simple point mappings, move to service classes if logic becomes complex.

### 4. Historical Data
**Question**: Do we need to track historical changes to game configs (e.g., point values change mid-season)?

**Recommendation**: Not for MVP. If needed later, add versioning to GameConfig.

### 5. Replay/Evidence Storage
**Question**: How do we link replays or other evidence to rounds/matches?

**Recommendation**: Add `ReplayFile` entity with foreign key to Round or Match. Out of scope for initial data model refactor.

---

## Success Criteria

- [ ] Can create and store a complete Rocket League match with all stats
- [ ] Can create and store a complete Trackmania match with placement-based scoring
- [ ] Schema enforces referential integrity (FK constraints)
- [ ] Game-specific stats are validated before persistence
- [ ] Can query matches and aggregate stats per player/team
- [ ] Can extend to new games without schema changes (via config + JSONB)

---

## Tasks Breakdown

### Database Schema
- [ ] Create `Game` entity and table
- [ ] Create `MatchType` entity and table
- [ ] Create `Match` entity with game FK
- [ ] Create `Round` entity with match FK
- [ ] Create `RoundResult` entity with flexible team/player FKs
- [ ] Create `MatchTeam` entity for aggregate team results
- [ ] Create `MatchPlayer` entity for aggregate player results
- [ ] Write TypeORM migrations
- [ ] Add indexes for common queries (match by game, player stats, etc.)

### Game Configuration
- [ ] Define GameConfig TypeScript interface
- [ ] Create Rocket League game config with stat definitions
- [ ] Create Trackmania game config
- [ ] Seed database with initial game records

### Validation & Business Logic
- [ ] Create Zod schemas for RL stats
- [ ] Create Zod schemas for Trackmania stats
- [ ] Implement game-agnostic match creation service
- [ ] Implement game-specific stat validation middleware
- [ ] Implement scoring calculation logic (points for placement, etc.)

### API Endpoints
- [ ] Update `POST /matches` to accept game parameter
- [ ] Update `POST /matches/:id/rounds` for round submission
- [ ] Update `GET /matches/:id` to return game-aware structure
- [ ] Update `GET /players/:id/stats` to filter by game
- [ ] Add `GET /games` endpoint to list available games

### Testing
- [ ] Unit tests for game config parsing
- [ ] Unit tests for stat validation (per game)
- [ ] Integration tests for RL match flow
- [ ] Integration tests for Trackmania match flow
- [ ] E2E tests for match creation and retrieval

### Documentation
- [ ] Document new schema in ERD
- [ ] API documentation for game-specific endpoints
- [ ] Examples for each supported game type
- [ ] Migration guide from v1 (if any data needs manual porting)

---

## Future Considerations

### Potential Games & Structures
- **Apex Legends**: Battle royale, 20 teams of 3, placement + kills scoring
- **Valorant**: Team vs team, best of 13/25 rounds, individual K/D/A stats

### Extensibility Points
- JSONB fields allow new stat types without migrations
- Game config allows new games without code changes (within reason)
- RoundResult flexibility supports team-based, individual, or hybrid results

### Performance Considerations
- JSONB queries can be slow at scale; may need materialized views for leaderboards
- Consider partitioning matches by game if data volume grows significantly
- Index on `game.id` for filtering matches by game

---

## Dependencies

- **Blockers**: Infrastructure simplification (Postgres migration) should be complete
- **Nice to have**: RBAC system (to control who can submit matches for which games)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| JSONB stats are too flexible, leading to inconsistent data | Strict Zod validation before persistence; API layer enforces schemas |
| New game requires significant code changes | Design game config to be declarative; keep imperative logic minimal |
| Query performance degrades with JSONB stats | Add GIN indexes on JSONB columns; consider materialized views for aggregates |
| Schema changes disrupt ongoing development | Use feature flags to deploy incrementally; thorough testing before rollout |

---

## Related Documents

- [Roadmap](./roadmap.md)
- [Design Philosophy](./design-philosophy.md)
- [Unified Migration Plan](./unified-monolith-migration.md)
