# Feature Spec: Multi-Game ELO System

## Overview

Design and implement a flexible, graph-based ELO rating system that supports different calculation formulae for different games, with the ability to invalidate matches and recalculate dependent ratings.

## Current State (V1)

- Separate DGraph microservice with its own database
- Graph-based rating system where each match creates interconnected nodes
- Each player brings their current ELO to a match
- Match outcome affects all participating players' ratings
- Support for match invalidation with dependent recalculation
- Support for graph "compaction" to reduce size (single node per player)

## Target State (V2)

- PostgreSQL-based rating system (no separate DBMS)
- Maintain graph structure for invalidation and recalculation
- Support multiple games with different rating formulae
- Individual player ratings (not team ratings)
- Game-specific logic for extracting individual performance from team matches
- Efficient storage and querying of rating history

## Design Philosophy

Per our [design philosophy](./design-philosophy.md):
- **Consolidate**: Use PostgreSQL instead of DGraph (simpler operations)
- **Maintain power**: Keep graph structure for invalidation/recalculation
- **Game-agnostic core**: Pluggable formulae per game
- **Data integrity**: Use database constraints and transactions

---

## ELO Graph Concepts

### The Graph Structure

Each match creates a set of interconnected rating nodes:

```
Player A (1500) ──┐
                   ├──> Match 1 ──> Player A (1520)
Player B (1480) ──┘                  Player B (1460)

Player A (1520) ──┐
                   ├──> Match 2 ──> Player A (1510)
Player C (1500) ──┘                  Player C (1510)
```

**Key properties**:
- Each player starts with an initial rating (e.g., 1500)
- Each match references the player's **input rating** (from previous match or initial)
- Each match produces **output ratings** for all participants
- Output ratings become input ratings for subsequent matches
- Matches form a directed acyclic graph (DAG) per player per game

### Match Invalidation

When a match is invalidated:
1. Mark the match as invalid
2. Identify all dependent matches (any match using this match's output ratings as input)
3. Recalculate all dependent matches in topological order

```
Match 1 (VALID) → Match 2 (VALID) → Match 3 (VALID)
                     ↓ INVALIDATE
Match 1 (VALID) → Match 2 (INVALID) → Match 3 (RECALCULATED)
```

### Graph Compaction

Over time, the graph grows large. Compaction collapses a player's history into a single node:

```
Before compaction:
Initial (1500) → Match 1 (1520) → Match 2 (1510) → Match 3 (1530)

After compaction:
Compacted (1530) → [future matches]
```

Compaction is typically done during offseason when no active matches are being played.

---

## Data Model

### EloRatingNode

Represents a player's rating at a specific point in time (input or output of a match).

```typescript
@Entity()
class EloRatingNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Game)
  game: Game; // Ratings are per-game

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'float', nullable: true })
  uncertainty: number; // For systems like TrueSkill

  @ManyToOne(() => Match, { nullable: true })
  sourceMatch: Match; // Match that produced this rating (null for initial/compacted)

  @Column({ type: 'boolean', default: false })
  isCompacted: boolean; // True if this is a compaction node

  @Column()
  createdAt: Date;

  @Column({ type: 'enum', enum: RatingNodeType })
  nodeType: RatingNodeType; // INITIAL, MATCH_OUTPUT, COMPACTED
}

enum RatingNodeType {
  INITIAL = 'initial', // Starting rating for a player
  MATCH_OUTPUT = 'match_output', // Rating after a match
  COMPACTED = 'compacted', // Result of graph compaction
}
```

### MatchRatingCalculation

Links a match to the input and output rating nodes for all participants.

```typescript
@Entity()
class MatchRatingCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match)
  match: Match;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Game)
  game: Game;

  @ManyToOne(() => EloRatingNode)
  inputRating: EloRatingNode; // Rating before match

  @ManyToOne(() => EloRatingNode, { nullable: true })
  outputRating: EloRatingNode; // Rating after match (null if match invalidated)

  @Column({ type: 'float' })
  ratingChange: number; // Convenience field: output - input

  @Column({ type: 'boolean', default: false })
  isInvalidated: boolean; // True if match was invalidated

  @Column()
  calculatedAt: Date;

  @Column({ nullable: true })
  invalidatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  calculationMetadata: Record<string, any>; // Formula-specific data
}
```

### GameRatingConfig

Configuration for each game's ELO formula.

```typescript
@Entity()
class GameRatingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game)
  @Index()
  game: Game;

  @Column({ type: 'enum', enum: RatingSystem })
  system: RatingSystem; // ELO, GLICKO, TRUESKILL

  @Column({ type: 'jsonb' })
  parameters: RatingParameters;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column()
  effectiveFrom: Date; // For versioning if parameters change
}

enum RatingSystem {
  ELO = 'elo',
  GLICKO = 'glicko',
  TRUESKILL = 'trueskill',
}

interface RatingParameters {
  // ELO parameters
  kFactor?: number;
  initialRating?: number;

  // Glicko parameters
  ratingDeviation?: number;
  volatility?: number;

  // TrueSkill parameters
  mu?: number;
  sigma?: number;
  beta?: number;
  tau?: number;

  // Game-specific overrides
  customFormula?: string; // Reference to a formula implementation
}
```

---

## Rating Calculation Flow

### 1. Match Completion Trigger

When a match is completed:
1. Retrieve `GameRatingConfig` for the match's game
2. For each player, find their latest `EloRatingNode` for this game
3. Calculate new ratings using the configured formula
4. Create new `EloRatingNode` entries for outputs
5. Create `MatchRatingCalculation` entries linking input → match → output

### 2. Formula Selection

Based on `GameRatingConfig.system`, select the appropriate calculation service:

```typescript
interface RatingCalculationService {
  calculateRatings(
    match: Match,
    inputRatings: Map<Player, EloRatingNode>,
    config: GameRatingConfig
  ): Map<Player, number>;
}

class EloCalculationService implements RatingCalculationService {
  calculateRatings(match, inputRatings, config) {
    // Standard ELO formula
    // K-factor from config.parameters.kFactor
    // Expected outcome based on team ratings
    // Actual outcome from match.matchTeams.isWinner
  }
}

class GlickoCalculationService implements RatingCalculationService {
  calculateRatings(match, inputRatings, config) {
    // Glicko-2 formula with rating deviation
  }
}

class TrueSkillCalculationService implements RatingCalculationService {
  calculateRatings(match, inputRatings, config) {
    // TrueSkill formula for team games
  }
}
```

### 3. Game-Specific Performance Extraction

**Challenge**: How to extract individual performance from team matches?

**Solutions by game**:

**Rocket League**:
- Use team outcome (win/loss) as primary signal
- Optionally weight by individual stats (goals, assists, saves) if available
- For now: simple team-based calculation (all team members treated equally)

**Trackmania**:
- Individual placement already available per round
- Aggregate individual placements across all rounds
- Calculate individual rating changes based on individual performance

**Future (Apex/Valorant)**:
- May use hybrid: team outcome + individual K/D ratio
- Or pure individual placement (Apex)

**Implementation**:
```typescript
interface PerformanceExtractor {
  extractPerformance(
    player: Player,
    match: Match
  ): PlayerPerformance;
}

interface PlayerPerformance {
  outcome: 'win' | 'loss' | 'draw';
  individualScore?: number; // For non-binary outcomes
  contributionWeight?: number; // 0-1, for weighted team outcomes
}
```

---

## Match Invalidation & Recalculation

### Invalidation Flow

1. **Mark match as invalid**:
   ```sql
   UPDATE match SET status = 'INVALIDATED' WHERE id = :matchId;
   UPDATE match_rating_calculation
   SET is_invalidated = true, invalidated_at = NOW()
   WHERE match_id = :matchId;
   ```

2. **Find dependent matches**:
   - Any `MatchRatingCalculation` where `inputRating` references an `EloRatingNode` from the invalidated match

3. **Recalculate in topological order**:
   - Build dependency graph of matches
   - Sort topologically (oldest first)
   - Recalculate each match's ratings using corrected input ratings

```typescript
async invalidateMatch(matchId: string): Promise<void> {
  const match = await this.matchRepo.findOne(matchId);

  // Mark as invalidated
  match.status = MatchStatus.INVALIDATED;
  await this.matchRepo.save(match);

  // Find all dependent matches
  const dependentMatches = await this.findDependentMatches(matchId);

  // Topological sort
  const sortedMatches = this.topologicalSort(dependentMatches);

  // Recalculate each in order
  for (const depMatch of sortedMatches) {
    await this.recalculateMatchRatings(depMatch);
  }
}

async findDependentMatches(matchId: string): Promise<Match[]> {
  // Find all EloRatingNodes from this match
  const outputNodes = await this.ratingNodeRepo.find({
    where: { sourceMatch: { id: matchId } }
  });

  // Find all MatchRatingCalculations using these nodes as inputs
  const dependentCalcs = await this.matchCalcRepo.find({
    where: { inputRating: In(outputNodes.map(n => n.id)) }
  });

  // Extract unique matches
  const matchIds = [...new Set(dependentCalcs.map(c => c.match.id))];
  return this.matchRepo.findByIds(matchIds);
}
```

---

## Graph Compaction

### Compaction Flow

Typically run during offseason to reduce graph size:

1. **For each player/game combination**:
   - Find all `EloRatingNode` entries
   - Identify the latest rating (most recent match or compaction)
   - Create a new `COMPACTED` node with this rating
   - Mark old nodes as archived (don't delete for audit trail)

2. **Update future matches**:
   - Any future matches should reference the compacted node as input

```typescript
async compactPlayerRatings(playerId: string, gameId: string): Promise<void> {
  // Find latest rating node
  const latestNode = await this.ratingNodeRepo.findOne({
    where: { player: { id: playerId }, game: { id: gameId } },
    order: { createdAt: 'DESC' }
  });

  // Create compacted node
  const compactedNode = new EloRatingNode();
  compactedNode.player = latestNode.player;
  compactedNode.game = latestNode.game;
  compactedNode.rating = latestNode.rating;
  compactedNode.uncertainty = latestNode.uncertainty;
  compactedNode.nodeType = RatingNodeType.COMPACTED;
  compactedNode.isCompacted = true;

  await this.ratingNodeRepo.save(compactedNode);

  // Archive old nodes (soft delete or flag)
  await this.ratingNodeRepo.update(
    {
      player: { id: playerId },
      game: { id: gameId },
      isCompacted: false
    },
    { isArchived: true }
  );
}
```

**When to compact**:
- During offseason (no active matches)
- After a certain number of matches (e.g., every 100 matches per player)
- On-demand via admin action

---

## Migration from DGraph

### Data Export

1. Export all rating nodes from DGraph
2. Export all match→rating relationships
3. Map to PostgreSQL schema

### Import Strategy

- Create `EloRatingNode` entries for all historical ratings
- Create `MatchRatingCalculation` entries for all matches
- Validate graph integrity (no orphaned nodes, correct dependencies)

### Validation

- Compare current ratings in v1 vs v2
- Recalculate a sample of matches to verify formula correctness
- Ensure invalidation logic produces same results

---

## Open Questions & Design Decisions

### 1. Rating Recalculation Strategy

**Question**: When a match is invalidated, should we recalculate **all** dependent matches, or only until ratings stabilize?

**Recommendation**: Recalculate all dependent matches to ensure graph integrity. Performance impact should be minimal if we limit cascade depth with proper indexing.

### 2. Real-time vs Batch Calculation

**Question**: Should ratings be calculated immediately after match completion, or in a background job?

**Options**:
- **Synchronous**: Calculate during match submission (slow, blocking)
- **Asynchronous**: Queue for background processing (faster, eventual consistency)

**Recommendation**: Asynchronous with background worker. Acceptable for ratings to be slightly delayed (seconds to minutes).

### 3. Handling Formula Changes

**Question**: If we change ELO parameters (e.g., K-factor) mid-season, do we retroactively recalculate?

**Recommendation**: **No retroactive recalculation** (as per your requirements). Use `GameRatingConfig.effectiveFrom` to version parameters. Future matches use new parameters.

### 4. Multiple Rating Systems per Game

**Question**: Can a game support multiple rating systems simultaneously (e.g., ELO and TrueSkill)?

**Recommendation**: Not for MVP. Pick one system per game. If needed later, add `RatingSystem` to `EloRatingNode` and track separately.

### 5. Rating Decay

**Question**: Should ratings decay over time for inactive players?

**Recommendation**: Not for MVP. Can add later with a scheduled job that reduces ratings or increases uncertainty for inactive players.

---

## API Endpoints

### Public Endpoints

- `GET /players/:id/ratings/:game` - Get current rating for a player in a game
- `GET /players/:id/rating-history/:game` - Get rating history (graph nodes)
- `GET /leaderboard/:game` - Get top players by rating
- `GET /matches/:id/rating-changes` - Get rating changes for all players in a match

### Admin Endpoints

- `POST /admin/ratings/compact/:game` - Trigger graph compaction for a game
- `POST /admin/matches/:id/invalidate` - Invalidate a match and recalculate
- `POST /admin/ratings/recalculate/:game` - Recalculate all ratings for a game
- `GET /admin/ratings/config/:game` - Get rating config for a game
- `PUT /admin/ratings/config/:game` - Update rating config

---

## Tasks Breakdown

### Database Schema
- [ ] Create `EloRatingNode` entity and migration
- [ ] Create `MatchRatingCalculation` entity and migration
- [ ] Create `GameRatingConfig` entity and migration
- [ ] Add indexes for rating queries (player+game, match, latest rating)
- [ ] Add unique constraint on compacted nodes (one per player per game at a time)

### Rating Calculation
- [ ] Implement `RatingCalculationService` interface
- [ ] Implement `EloCalculationService` (standard ELO)
- [ ] Implement `GlickoCalculationService` (if needed)
- [ ] Implement `TrueSkillCalculationService` (if needed)
- [ ] Create `PerformanceExtractor` for Rocket League
- [ ] Create `PerformanceExtractor` for Trackmania
- [ ] Hook rating calculation into match completion flow

### Invalidation & Recalculation
- [ ] Implement `findDependentMatches` query
- [ ] Implement topological sort for match dependencies
- [ ] Implement `recalculateMatchRatings` logic
- [ ] Implement `invalidateMatch` flow with transaction safety

### Graph Compaction
- [ ] Implement `compactPlayerRatings` logic
- [ ] Create admin endpoint to trigger compaction
- [ ] Add scheduled job for periodic compaction (optional)

### Migration from DGraph
- [ ] Export data from DGraph
- [ ] Write import script for historical ratings
- [ ] Validate imported data integrity
- [ ] Compare v1 vs v2 ratings for sample players

### Testing
- [ ] Unit tests for each rating formula
- [ ] Unit tests for performance extractors
- [ ] Integration tests for rating calculation flow
- [ ] Integration tests for invalidation and recalculation
- [ ] Integration tests for compaction
- [ ] Load tests for large graphs (10k+ matches)

### Documentation
- [ ] Document rating formulae for each game
- [ ] Document graph structure and invalidation logic
- [ ] API documentation for rating endpoints
- [ ] Admin guide for managing rating configs

---

## Success Criteria

- [ ] Can calculate ratings for Rocket League matches
- [ ] Can calculate ratings for Trackmania matches
- [ ] Match invalidation correctly recalculates dependent matches
- [ ] Graph compaction reduces node count without data loss
- [ ] Performance: rating calculation completes within 5 seconds for a match
- [ ] Performance: invalidation + recalculation completes within 30 seconds for 100 dependent matches
- [ ] API returns current ratings in <100ms
- [ ] Migration from DGraph preserves all historical ratings

---

## Performance Considerations

### Indexes

Critical indexes for performance:
```sql
CREATE INDEX idx_rating_node_player_game ON elo_rating_node(player_id, game_id, created_at DESC);
CREATE INDEX idx_rating_calc_match ON match_rating_calculation(match_id);
CREATE INDEX idx_rating_calc_input ON match_rating_calculation(input_rating_id);
```

### Query Optimization

- **Latest rating lookup**: Use index on `(player_id, game_id, created_at DESC)` with `LIMIT 1`
- **Dependent match lookup**: Use index on `input_rating_id` for fast joins
- **Leaderboard**: Materialized view refreshed periodically (not real-time)

### Scaling Considerations

- If graph becomes very large (millions of nodes), consider partitioning by game
- If recalculation becomes slow, implement parallel processing for independent branches
- If compaction becomes expensive, run incrementally (chunk by player)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Recalculation cascades affect too many matches | Add circuit breaker: limit cascade depth or number of matches |
| PostgreSQL performance degrades with large graphs | Aggressive indexing; periodic compaction; materialized views |
| Formula bugs cause incorrect ratings | Comprehensive unit tests; compare against v1 for validation |
| Concurrent match submissions cause race conditions | Use database transactions; lock rating nodes during updates |
| Migration from DGraph loses data | Extensive validation; keep DGraph running in parallel during transition |

---

## Related Documents

- [Roadmap](./roadmap.md)
- [Multi-Game Data Model](./feature-multi-game-data-model.md)
- [Design Philosophy](./design-philosophy.md)
