# ~~Feature Spec: V1 Microservices Migration~~

## ⚠️ DEPRECATED
This plan has been superseded by the [Unified Migration to Monolith + PostgreSQL-Only Architecture](../unified-monolith-migration.md) which provides a more efficient approach by integrating Matchmaking and Submissions into Core, eliminating their Redis dependencies entirely.

## Overview

~~Migrate five v1 microservices into the v2 architecture and Docker Compose network, removing dependencies on Redis and RabbitMQ, and integrating with the PostgreSQL-backed data model.~~

**Note**: The approach below is retained for historical reference but should not be implemented as-is. The unified migration plan provides a more efficient strategy by consolidating services into a monolith where appropriate.

## Current State

Five microservices currently in production:
1. **Notifications** - Sends notifications to users (Discord, email, etc.)
2. **Image Generation** - Creates match result images for social sharing
3. **Replay Parse** - Parses game replay files to extract stats
4. **Matchmaking** - Manages scrim queues and match creation
5. **Submissions** - Handles match result submissions

**Current dependencies**:
- Redis for temporary data storage (matchmaking, submissions)
- RabbitMQ for event-driven communication
- Separate deployment infrastructure
- Independent data models

## Target State

All services integrated into v2 architecture:
- PostgreSQL for all data persistence
- TypeORM for type-safe data access
- Docker Compose network for local development
- Shared code/types where appropriate
- Event-driven patterns via PostgreSQL (pg_notify, polling, or simple HTTP callbacks)

## Design Philosophy

Per our [design philosophy](../design-philosophy.md):
- **Consolidate** services where practical (don't maintain separate services if not needed)
- **Simplify** by removing Redis/RabbitMQ dependencies
- **Leverage PostgreSQL** for queuing, events, and persistence
- **Maintain service boundaries** only where performance/scaling demands it

---

## Service Migration Order

Based on coupling analysis, migrate in this order:

### 1. Notifications (Least Coupled)
**Why first**: Minimal dependencies, clear boundaries, can be standalone

### 2. Image Generation (Low Coupling)
**Why second**: Clear input/output, no state management, good pattern-setter

### 3. Replay Parse (Medium Coupling)
**Why third**: More complex, but well-defined scope

### 4. Submissions (High Coupling)
**Why fourth**: Currently uses Redis, depends on data model

### 5. Matchmaking (Highest Coupling)
**Why last**: Complex state management, Redis-dependent, queue logic

---

## Service 1: Notifications

### Current Architecture
- Receives events via RabbitMQ
- Sends notifications to Discord, email, SMS(?), etc.
- Stores notification history (where?)

### Target Architecture

**Decision Point**: Should this remain a separate microservice or be integrated into core?

**Recommendation**: Keep as separate service for:
- Independent scaling (notification bursts)
- Isolation of third-party API failures (Discord downtime doesn't affect core)
- Clear responsibility boundary

**Migration Plan**:
1. Replace RabbitMQ with PostgreSQL-based event queue
   - Option A: `pg_notify` for real-time events
   - Option B: Polling `notifications_queue` table
   - Option C: HTTP webhooks from core service
2. Create `Notification` entity for history tracking
3. Define event schema for triggers (match completed, scrim ready, etc.)
4. Add to Docker Compose network
5. Configure retry logic and dead-letter handling

**Schema**:
```typescript
@Entity()
class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel; // DISCORD, EMAIL, SMS

  @Column()
  recipientId: string; // User ID or channel ID

  @Column({ type: 'enum', enum: NotificationStatus })
  status: NotificationStatus; // PENDING, SENT, FAILED

  @Column({ type: 'jsonb' })
  payload: Record<string, any>; // Message content, embeds, etc.

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ default: 0 })
  retryCount: number;

  @ManyToOne(() => Match, { nullable: true })
  match: Match; // Optional link to triggering event
}
```

**Tasks**:
- [ ] Create `Notification` entity and migration
- [ ] Implement PostgreSQL event queue (choose mechanism)
- [ ] Port Discord notification logic
- [ ] Port email notification logic
- [ ] Add retry and error handling
- [ ] Update Docker Compose with notifications service
- [ ] Configure environment variables
- [ ] Write integration tests
- [ ] Document event schema and triggers

---

## Service 2: Image Generation

### Current Architecture
- Generates images for match results, player stats, etc.
- Uses Puppeteer/headless Chrome or similar?
- Triggered via RabbitMQ events

### Target Architecture

**Decision Point**: Separate service or integrated?

**Recommendation**: Keep as separate service for:
- Heavy resource usage (headless browser)
- Independent scaling
- Isolation (crashes don't affect core)

**Migration Plan**:
1. Replace RabbitMQ with event queue (same as notifications)
2. Store generated images in S3/MinIO/local storage
3. Create `GeneratedImage` entity for tracking
4. Add to Docker Compose with shared volume or object storage

**Schema**:
```typescript
@Entity()
class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ImageType })
  type: ImageType; // MATCH_RESULT, PLAYER_CARD, LEADERBOARD

  @Column()
  storageUrl: string; // S3 URL or local path

  @ManyToOne(() => Match, { nullable: true })
  match: Match;

  @ManyToOne(() => Player, { nullable: true })
  player: Player;

  @Column()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dimensions, format, etc.
}
```

**Tasks**:
- [ ] Create `GeneratedImage` entity and migration
- [ ] Port image generation logic (Puppeteer/Canvas/etc.)
- [ ] Implement event-driven trigger
- [ ] Configure storage backend (S3 vs local)
- [ ] Add to Docker Compose
- [ ] Write tests for image generation
- [ ] Document image templates and customization

---

## Service 3: Replay Parse

### Current Architecture
- Parses game replay files (Rocket League, Trackmania)
- Extracts stats, events, player performance
- Triggered when replay uploaded

### Target Architecture

**Decision Point**: Separate service or integrated?

**Recommendation**: Keep as separate service for:
- CPU-intensive processing
- Game-specific parsing libraries may have dependencies
- Clear boundary: file in → stats out

**Migration Plan**:
1. Create `ReplayFile` entity to track uploads
2. Store raw replay files in object storage
3. Parse and extract stats into match/round/player stats
4. Event-driven: trigger on file upload
5. Support multiple game types (RL, Trackmania)

**Schema**:
```typescript
@Entity()
class ReplayFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match, { nullable: true })
  match: Match; // May not be associated immediately

  @ManyToOne(() => Round, { nullable: true })
  round: Round;

  @ManyToOne(() => Game)
  game: Game;

  @Column()
  storageUrl: string;

  @Column({ type: 'enum', enum: ReplayStatus })
  status: ReplayStatus; // UPLOADED, PARSING, PARSED, FAILED

  @Column({ nullable: true })
  parsedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  parsedData: Record<string, any>; // Raw parsed output

  @Column({ nullable: true })
  failureReason: string;
}
```

**Tasks**:
- [ ] Create `ReplayFile` entity and migration
- [ ] Implement file upload endpoint
- [ ] Port Rocket League replay parser
- [ ] Port Trackmania replay parser (if exists)
- [ ] Map parsed data to `RoundResult` stats
- [ ] Add to Docker Compose
- [ ] Handle parsing failures gracefully
- [ ] Write tests with sample replay files
- [ ] Document supported replay formats

---

## Service 4: Submissions

### Current Architecture
- Handles match result submissions
- Currently uses Redis for temporary storage during match play
- Validates submissions, calculates scores

### Target Architecture

**Decision Point**: Separate service or integrated into core?

**Recommendation**: **Integrate into core API** because:
- Tightly coupled to match data model
- No benefit to separate deployment
- Simplifies development (same codebase, shared types)
- **Eliminates Redis migration complexity** (this was a key insight in the unified plan)

**Migration Plan**:
1. Replace Redis temporary storage with PostgreSQL tables
2. Create `MatchSubmission` workflow entities
3. Add validation logic to core API
4. Use database transactions for atomicity
5. Trigger events for downstream services (notifications, image gen)

**Schema**:
```typescript
@Entity()
class MatchSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match)
  match: Match;

  @ManyToOne(() => User)
  submittedBy: User;

  @Column({ type: 'enum', enum: SubmissionStatus })
  status: SubmissionStatus; // PENDING, APPROVED, REJECTED

  @Column({ type: 'jsonb' })
  submittedData: Record<string, any>; // Raw submission payload

  @Column()
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User;

  @Column({ nullable: true })
  rejectionReason: string;
}
```

**Tasks**:
- [ ] Create submission workflow entities
- [ ] Migrate submission validation logic to core
- [ ] Replace Redis storage with PostgreSQL
- [ ] Implement transaction-based submission flow
- [ ] Add submission approval/rejection endpoints
- [ ] Trigger notifications on submission events
- [ ] Write integration tests for submission flow
- [ ] Document submission API and validation rules

---

## Service 5: Matchmaking

### Current Architecture
- Manages scrim queues (players waiting for matches)
- Currently uses Redis for queue state
- Matches players based on skill, availability, game type

### Target Architecture

**Decision Point**: Separate service or integrated?

**Recommendation**: **Integrate into core API** because:
- Tightly coupled to player/team/match data
- Queue state can be managed in PostgreSQL
- Simplifies deployment and testing
- **Eliminates Redis migration complexity** (this was a key insight in the unified plan)

**Migration Plan**:
1. Replace Redis queue with PostgreSQL `ScrimQueue` table
2. Implement queue management logic in core
3. Use database locks for concurrency control
4. Background worker for matchmaking algorithm (see [unified migration plan](../unified-monolith-migration.md))
5. Trigger match creation when queue ready

**Schema**:
```typescript
@Entity()
class ScrimQueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Game)
  game: Game;

  @Column()
  skillRating: number;

  @Column()
  queuedAt: Date;

  @Column({ type: 'enum', enum: QueueStatus })
  status: QueueStatus; // QUEUED, MATCHED, EXPIRED, CANCELLED

  @Column({ nullable: true })
  matchedAt: Date;

  @ManyToOne(() => Match, { nullable: true })
  match: Match; // Once matched
}

@Entity()
class ScrimTimeout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Player)
  player: Player;

  @Column()
  expiresAt: Date;

  @Column()
  reason: string;
}
```

**Tasks**:
- [ ] Create queue entities and migrations
- [ ] Port queue management logic from Redis to PostgreSQL
- [ ] Implement matchmaking algorithm
- [ ] Create background worker for queue processing
- [ ] Add queue join/leave endpoints
- [ ] Implement timeout/cooldown logic
- [ ] Write tests for matchmaking scenarios
- [ ] Document queue behavior and matchmaking rules

---

## Cross-Cutting Concerns

### Event-Driven Communication

**Options for replacing RabbitMQ**:

1. **PostgreSQL `pg_notify`**: Real-time, lightweight, built-in
   - Pros: Simple, no external dependencies
   - Cons: No persistence, messages lost if consumer offline

2. **Polling event queue table**: Reliable, persistent
   - Pros: Guaranteed delivery, simple to implement
   - Cons: Higher latency, polling overhead

3. **HTTP webhooks**: Simple, synchronous
   - Pros: Easy to debug, standard REST patterns
   - Cons: Coupling between services, retry logic needed

**Recommendation**: Start with **polling event queue** for reliability, optimize to `pg_notify` if latency becomes an issue.

**Schema**:
```typescript
@Entity()
class EventQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType; // MATCH_COMPLETED, PLAYER_JOINED_QUEUE, etc.

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ type: 'enum', enum: EventStatus })
  status: EventStatus; // PENDING, PROCESSED, FAILED

  @Column({ default: 0 })
  retryCount: number;
}
```

### Docker Compose Integration

All services need to be added to `docker-compose.yml`:

```yaml
services:
  notifications:
    build: ./services/notifications
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    networks:
      - sprocket-network

  image-generation:
    build: ./services/image-generation
    depends_on:
      - postgres
    volumes:
      - ./storage/images:/app/images
    networks:
      - sprocket-network

  # ... etc.
```

---

## Testing Strategy

### Unit Tests
- Service-specific logic (parsers, validators, formatters)
- Mocked database and external APIs

### Integration Tests
- End-to-end service flows (e.g., upload replay → parse → store stats)
- Real PostgreSQL database (test containers)

### E2E Tests
- Full workflows (e.g., submit match → generate image → send notification)
- Docker Compose environment

---

## Rollout Plan

### Phase 1: Notifications & Image Gen (Low Risk)
1. Migrate and deploy notifications service
2. Migrate and deploy image generation service
3. Monitor for issues, validate event delivery

### Phase 2: Replay Parse (Medium Risk)
1. Migrate replay parse service
2. Test with sample replays for all supported games
3. Deploy alongside v1 for validation period

### Phase 3: Submissions & Matchmaking (High Risk)
1. Migrate submissions to core API
2. Migrate matchmaking to core API
3. Extensive testing of queue and submission flows
4. Phased rollout with feature flags

---

## Success Criteria

- [ ] All services running in Docker Compose locally
- [ ] No Redis dependencies
- [ ] No RabbitMQ dependencies
- [ ] Event-driven communication working via PostgreSQL
- [ ] Test coverage >80% for each service
- [ ] Documentation for each service's API and behavior
- [ ] Monitoring and logging in place

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Event queue polling causes performance issues | Use `pg_notify` for high-frequency events; optimize poll intervals |
| Microservices require too much operational overhead | Consolidate services (submissions, matchmaking) into core API |
| PostgreSQL becomes bottleneck for queue | Add indexes; consider read replicas if needed |
| Replay parsing fails for edge cases | Comprehensive test suite with real replay files; graceful error handling |

---

## Related Documents

- [Roadmap](../roadmap.md)
- [Unified Migration Plan](../unified-monolith-migration.md)
- [Multi-Game Data Model](../feature-multi-game-data-model.md)