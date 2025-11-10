---
sidebar_position: 2
title: Unified Migration to Monolith + PostgreSQL-Only Architecture
---

# Unified Migration to Monolith + PostgreSQL-Only Architecture

## Overview

This document replaces both the [Redis/RabbitMQ removal plan](./archive/detailed-migration-plan.md) and the [V1 microservices migration plan](./archive/feature-v1-microservices-migration.md) with a unified approach that achieves both goals more efficiently.

**Key Insight**: By migrating Matchmaking and Submissions into the Core service (creating a monolith), we eliminate their Redis dependencies entirely and simplify RabbitMQ removal through direct function calls rather than event queues.

## Current State Analysis

**Existing Architecture Issues:**
- 5 separate V1 microservices with Redis/RabbitMQ dependencies
- Complex inter-service communication patterns
- Redundant infrastructure (Redis + RabbitMQ + PostgreSQL)
- Operational overhead managing multiple services

**Target Architecture:**
- **Core Service**: Monolith containing Core + Matchmaking + Submissions
- **Remaining Services**: Notifications, Image Generation, Replay Parse (as separate services)
- **Single Database**: PostgreSQL-only with TypeORM
- **Event System**: PostgreSQL-based event queues only for remaining microservices

## Unified Migration Strategy

### Phase 1: Core Service Consolidation (Week 1-2)
**Goal**: Integrate Matchmaking and Submissions into Core, eliminating their Redis dependencies

#### 1.1 Matchmaking Integration
**Current**: Standalone service with Redis for queue state
**Target**: Integrated into Core with PostgreSQL queue tables

**Schema Changes**:
```typescript
// Core database tables
@Entity()
class ScrimQueue {
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
  match: Match;
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

**Code Changes**:
- Move [`services/matchmaking/src/`](services/matchmaking/src/) to [`core/src/matchmaking/`](core/src/matchmaking/)
- Replace Redis queue logic with TypeORM repositories
- Replace [`services/matchmaking/src/redis.ts`](services/matchmaking/src/redis.ts) with [`core/src/matchmaking/data-source.ts`](core/src/matchmaking/data-source.ts)
- Integrate queue timeout logic into Core's cron system
- Remove RabbitMQ event publishing → use direct function calls

#### 1.2 Submissions Integration
**Current**: Standalone service with Redis for temporary storage
**Target**: Integrated into Core with PostgreSQL submission workflow

**Schema Changes**:
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
  submittedData: Record<string, any>;

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

**Code Changes**:
- Move [`services/submission/src/`](services/submission/src/) to [`core/src/submissions/`](core/src/submissions/)
- Replace Redis temporary storage with PostgreSQL tables
- Integrate submission validation into Core's validation pipeline
- Replace RabbitMQ events with direct function calls to other Core modules

#### 1.3 Infrastructure Cleanup
- Remove Redis from [`docker-compose.yaml`](docker-compose.yaml) and [`nomad.job.hcl`](nomad.job.hcl)
- Remove Redis-related environment variables from [`.env.example`](.env.example)
- Delete [`lib/src/redis/`](lib/src/redis/) module
- Remove Redis cache interceptor from [`core/src/global/cache.interceptor.ts`](core/src/global/cache.interceptor.ts)

### Phase 2: PostgreSQL Event System (Week 2-3)
**Goal**: Create event queue infrastructure for remaining microservices

#### 2.1 Event Queue Implementation
**For Services**: Notifications, Image Generation, Replay Parse

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

  @Column({ type: 'enum', enum: EventTarget })
  targetService: EventTarget; // NOTIFICATIONS, IMAGE_GEN, REPLAY_PARSE
}
```

**Implementation Pattern**:
- **Producers** (Core service): `INSERT INTO event_queue ...`
- **Consumers** (separate services): Poll with `SELECT ... WHERE status = 'PENDING' AND targetService = ? FOR UPDATE SKIP LOCKED`
- **Processing**: Update `status = 'PROCESSED'` after successful handling

### Phase 3: Remaining Service Migrations (Week 3-4)
**Goal**: Migrate Notifications, Image Generation, and Replay Parse with PostgreSQL event queues

#### 3.1 Notifications Service
**Current**: RabbitMQ consumer, sends Discord/email notifications
**Target**: PostgreSQL event queue consumer

**Schema**:
```typescript
@Entity()
class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel; // DISCORD, EMAIL, SMS

  @Column()
  recipientId: string;

  @Column({ type: 'enum', enum: NotificationStatus })
  status: NotificationStatus; // PENDING, SENT, FAILED

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ default: 0 })
  retryCount: number;

  @ManyToOne(() => Match, { nullable: true })
  match: Match;
}
```

#### 3.2 Image Generation Service
**Current**: RabbitMQ consumer, generates match result images
**Target**: PostgreSQL event queue consumer

**Schema**:
```typescript
@Entity()
class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ImageType })
  type: ImageType; // MATCH_RESULT, PLAYER_CARD, LEADERBOARD

  @Column()
  storageUrl: string;

  @ManyToOne(() => Match, { nullable: true })
  match: Match;

  @ManyToOne(() => Player, { nullable: true })
  player: Player;

  @Column()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
```

#### 3.3 Replay Parse Service
**Current**: RabbitMQ consumer, parses game replay files
**Target**: PostgreSQL event queue consumer

**Schema**:
```typescript
@Entity()
class ReplayFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match, { nullable: true })
  match: Match;

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
  parsedData: Record<string, any>;

  @Column({ nullable: true })
  failureReason: string;
}
```

### Phase 4: Final Infrastructure Cleanup (Week 4)
**Goal**: Remove RabbitMQ and complete the migration

#### 4.1 RabbitMQ Removal
- Remove RabbitMQ from [`docker-compose.yaml`](docker-compose.yaml) and [`nomad.job.hcl`](nomad.job.hcl)
- Delete [`lib/src/rmq/`](lib/src/rmq/) module
- Remove RabbitMQ-related environment variables
- Delete broker files from migrated services

#### 4.2 Service Integration
- Add remaining services to [`docker-compose.yaml`](docker-compose.yaml):
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

  replay-parse:
    build: ./services/replay-parse
    depends_on:
      - postgres
    volumes:
      - ./storage/replays:/app/replays
    networks:
      - sprocket-network
```

## Testing Strategy

### Unit Tests
- Service-specific logic with mocked repositories
- Event queue processing logic
- Data transformation and validation

### Integration Tests
- End-to-end flows: Core → Event Queue → Consumer Service
- Real PostgreSQL database with test containers
- Event delivery and processing verification

### E2E Tests
- Full workflows: Match completion → Image generation → Notification delivery
- Docker Compose environment testing
- Service health and connectivity validation

## Migration Timeline

### Week 1-2: Core Consolidation
- [ ] Integrate Matchmaking into Core
- [ ] Integrate Submissions into Core
- [ ] Remove Redis infrastructure
- [ ] Test integrated Core functionality

### Week 2-3: Event System
- [ ] Implement PostgreSQL event queue
- [ ] Create event producers in Core
- [ ] Test event publishing

### Week 3-4: Service Migration
- [ ] Migrate Notifications service
- [ ] Migrate Image Generation service
- [ ] Migrate Replay Parse service
- [ ] Test all consumer services

### Week 4: Final Cleanup
- [ ] Remove RabbitMQ infrastructure
- [ ] Update deployment configurations
- [ ] Performance testing and optimization
- [ ] Documentation updates

## Success Criteria

- [ ] All services running in Docker Compose locally
- [ ] No Redis dependencies remaining
- [ ] No RabbitMQ dependencies remaining
- [ ] Event-driven communication working via PostgreSQL
- [ ] Test coverage >80% for each service
- [ ] Documentation for each service's API and behavior
- [ ] Monitoring and logging in place
- [ ] Performance comparable to or better than v1 architecture

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Monolith becomes too complex | Clear module boundaries within Core; consider re-splitting if needed |
| PostgreSQL event queue performance issues | Optimize polling intervals; add indexes; consider pg_notify for high-frequency events |
| Service integration failures | Comprehensive testing; feature flags for gradual rollout |
| Data migration complexity | Backup strategies; rollback procedures; incremental migration approach |

## Related Documents

- [Roadmap](./roadmap.md)
- [Design Philosophy](./design-philosophy.md)
- [Multi-Game Data Model](./feature-multi-game-data-model.md)
- [Core Overview](./core/overview.md)