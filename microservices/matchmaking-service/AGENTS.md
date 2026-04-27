# Matchmaking Service Agent Instructions

## Service Overview

**Workspace:** `microservices/matchmaking-service/`
**Type:** Node.js Microservice
**Port:** 3002
**Health Endpoint:** `http://localhost:3002/health`
**Framework:** NestJS with TypeScript

## Module Responsibility

The matchmaking service handles:
- Scrim queue management
- Team matching algorithms
- Scrim state machine (queued → popped → in-progress → completed)
- Player skill rating integration
- Queue position tracking
- Matchmaking metrics and analytics

## Key Architectural Patterns

### 1. State Machine Pattern

```typescript
// src/scrim/scrim.state-machine.ts
export enum ScrimState {
  QUEUED = 'queued',
  POPPED = 'popped',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class ScrimStateMachine {
  private static transitions: Record<ScrimState, ScrimState[]> = {
    [ScrimState.QUEUED]: [ScrimState.POPPED, ScrimState.CANCELLED],
    [ScrimState.POPPED]: [ScrimState.IN_PROGRESS, ScrimState.CANCELLED],
    [ScrimState.IN_PROGRESS]: [ScrimState.COMPLETED, ScrimState.CANCELLED],
    [ScrimState.COMPLETED]: [],
    [ScrimState.CANCELLED]: [],
  };

  static canTransition(from: ScrimState, to: ScrimState): boolean {
    return this.transitions[from].includes(to);
  }

  static transition(scrim: Scrim, newState: ScrimState): Scrim {
    if (!this.canTransition(scrim.state, newState)) {
      throw new InvalidStateTransitionError(scrim.state, newState);
    }
    scrim.state = newState;
    return scrim;
  }
}
```

### 2. Queue Management Pattern

```typescript
// src/queue/queue.service.ts
@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private queueRepo: Repository<QueueEntry>,
    private matchmakingAlgorithm: MatchmakingAlgorithm,
  ) {}

  async enqueue(playerId: string, teamId: string): Promise<QueueEntry> {
    const entry = this.queueRepo.create({
      playerId,
      teamId,
      joinedAt: new Date(),
      skillRating: await this.getPlayerRating(playerId),
    });
    
    return this.queueRepo.save(entry);
  }

  async findMatches(queueId: string): Promise<Match[]> {
    const entries = await this.queueRepo.find({
      where: { queueId, matched: false },
      order: { joinedAt: 'ASC' },
    });

    return this.matchmakingAlgorithm.findMatches(entries);
  }

  async dequeue(entryId: string): Promise<void> {
    await this.queueRepo.update(entryId, { leftAt: new Date() });
  }
}
```

### 3. Matchmaking Algorithm Pattern

```typescript
// src/algorithm/matchmaking.algorithm.ts
export interface MatchmakingConfig {
  maxRatingDiff: number;
  maxWaitTime: number;
  minPlayers: number;
}

@Injectable()
export class MatchmakingAlgorithm {
  constructor(private configService: ConfigService) {}

  findMatches(entries: QueueEntry[]): Match[] {
    const config = this.getConfig();
    const matches: Match[] = [];
    const used = new Set<string>();

    // Sort by rating
    const sorted = entries.sort((a, b) => a.skillRating - b.skillRating);

    // Greedy matching
    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i].id)) continue;

      const potentialMatch = this.findCompatibleEntries(
        sorted[i],
        sorted.slice(i + 1),
        config,
        used,
      );

      if (potentialMatch.length >= config.minPlayers) {
        matches.push(this.createMatch(potentialMatch));
        potentialMatch.forEach(e => used.add(e.id));
      }
    }

    return matches;
  }

  private findCompatibleEntries(
    seed: QueueEntry,
    candidates: QueueEntry[],
    config: MatchmakingConfig,
    used: Set<string>,
  ): QueueEntry[] {
    const compatible = [seed];

    for (const candidate of candidates) {
      if (used.has(candidate.id)) continue;

      const ratingDiff = Math.abs(candidate.skillRating - seed.skillRating);
      if (ratingDiff <= config.maxRatingDiff) {
        compatible.push(candidate);
      }

      if (compatible.length >= config.minPlayers) {
        break;
      }
    }

    return compatible;
  }
}
```

### 4. Message Queue Integration

```typescript
// src/events/scrim.events.ts
export class ScrimPoppedEvent {
  constructor(
    public readonly scrimId: string,
    public readonly players: string[],
    public readonly timestamp: Date,
  ) {}
}

// src/scrim/scrim.service.ts
@Injectable()
export class ScrimService {
  constructor(
    private eventEmitter: EventEmitter2,
    private queueService: QueueService,
  ) {}

  async popScrim(queueId: string): Promise<Scrim> {
    const matches = await this.queueService.findMatches(queueId);
    
    if (matches.length === 0) {
      throw new NoMatchesFoundError();
    }

    const scrim = await this.createScrim(matches[0]);
    
    // Emit event for other services
    this.eventEmitter.emit(
      'scrim.popped',
      new ScrimPoppedEvent(
        scrim.id,
        scrim.players.map(p => p.id),
        new Date(),
      ),
    );

    // Remove from queue
    await this.queueService.dequeueAll(matches[0].entries);

    return scrim;
  }
}
```

## Test Patterns

### Location
- Unit tests: `src/**/*.spec.ts`
- Integration tests: `test/integration/`
- E2E tests: `test/e2e/`

### Test Structure

```typescript
// src/algorithm/matchmaking.algorithm.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingAlgorithm } from './matchmaking.algorithm';
import { QueueEntry } from '../queue/entities/queue-entry.entity';

describe('MatchmakingAlgorithm', () => {
  let algorithm: MatchmakingAlgorithm;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingAlgorithm,
        {
          provide: ConfigService,
          useValue: {
            get: () => ({ maxRatingDiff: 100, minPlayers: 4 }),
          },
        },
      ],
    }).compile();

    algorithm = module.get<MatchmakingAlgorithm>(MatchmakingAlgorithm);
  });

  it('should find matches with similar ratings', () => {
    const entries: QueueEntry[] = [
      { id: '1', skillRating: 1000, joinedAt: new Date() },
      { id: '2', skillRating: 1050, joinedAt: new Date() },
      { id: '3', skillRating: 1100, joinedAt: new Date() },
      { id: '4', skillRating: 1500, joinedAt: new Date() }, // Outlier
    ];

    const matches = algorithm.findMatches(entries);

    expect(matches.length).toBe(1);
    expect(matches[0].entries).toHaveLength(3);
    expect(matches[0].entries.map(e => e.id)).not.toContain('4');
  });

  it('should not create matches below minimum players', () => {
    const entries: QueueEntry[] = [
      { id: '1', skillRating: 1000, joinedAt: new Date() },
      { id: '2', skillRating: 1500, joinedAt: new Date() }, // Too different
    ];

    const matches = algorithm.findMatches(entries);

    expect(matches.length).toBe(0);
  });
});
```

### Running Tests

```bash
# All tests
npm run test --workspace=matchmaking-service

# Specific test file
npm run test --workspace=matchmaking-service -- src/algorithm/matchmaking.algorithm.spec.ts

# With coverage
npm run test:cov --workspace=matchmaking-service

# E2E tests
npm run test:e2e --workspace=matchmaking-service
```

## Common Pitfalls

### ❌ Anti-Patterns

1. **Blocking the event loop with CPU-intensive matching**
   ```typescript
   // BAD: Blocking event loop
   async findMatches(): Promise<Match[]> {
     // ❌ Don't do this - blocks event loop
     const result = this.complexAlgorithm();
     return result;
   }
   ```

2. **Not handling queue race conditions**
   ```typescript
   // BAD: Race condition in dequeue
   async dequeue(entryId: string) {
     const entry = await this.repo.findOne(entryId);
     // ❌ Another request might dequeue between find and update
     entry.matched = true;
     await this.repo.save(entry);
   }
   ```

3. **Hardcoding algorithm parameters**
   ```typescript
   // BAD: Hardcoded values
   findMatches(entries: QueueEntry[]) {
     const maxRatingDiff = 100; // ❌ Should be configurable
     const minPlayers = 4;      // ❌ Should be configurable
   }
   ```

### ✅ Best Practices

1. **Use worker threads for CPU-intensive tasks**
   ```typescript
   // GOOD: Offload to worker thread
   async findMatches(): Promise<Match[]> {
     return new Promise((resolve, reject) => {
       const worker = new Worker('./matchmaking.worker.ts');
       worker.on('message', resolve);
       worker.on('error', reject);
       worker.postMessage(this.entries);
     });
   }
   ```

2. **Use transactions for queue operations**
   ```typescript
   // GOOD: Transaction for atomicity
   async dequeue(entryId: string) {
     const queryRunner = this.dataSource.createQueryRunner();
     await queryRunner.connect();
     await queryRunner.startTransaction();
     
     try {
       await queryRunner.manager.update(QueueEntry, entryId, {
         matched: true,
         matchedAt: new Date(),
       });
       await queryRunner.commitTransaction();
     } catch (error) {
       await queryRunner.rollbackTransaction();
       throw error;
     }
   }
   ```

3. **Make algorithm configurable**
   ```typescript
   // GOOD: Configurable parameters
   constructor(private configService: ConfigService) {}

   findMatches(entries: QueueEntry[]) {
     const config = this.configService.get<MatchmakingConfig>('matchmaking');
     const maxRatingDiff = config.maxRatingDiff;
     const minPlayers = config.minPlayers;
   }
   ```

## Architectural Rules

### State Transitions
- ✅ All state changes go through state machine
- ✅ Invalid transitions throw errors
- ✅ State changes are logged
- ❌ Direct state assignment
- ❌ Skipping state validation

### Queue Operations
- ✅ Use transactions for atomicity
- ✅ Handle race conditions
- ✅ Log queue metrics
- ❌ Non-atomic queue updates
- ❌ Ignoring queue timeouts

### Algorithm Changes
- ✅ Test with historical data
- ✅ A/B test new algorithms
- ✅ Monitor match quality metrics
- ❌ Deploy untested algorithm changes
- ❌ Change parameters without analysis

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5434/matchmaking
REDIS_URL=redis://localhost:6379/0
RABBITMQ_URL=amqp://admin:localrabbitpass@localhost:5672//

# Matchmaking Algorithm
MATCHMAKING_MAX_RATING_DIFF=100
MATCHMAKING_MIN_PLAYERS=4
MATCHMAKING_MAX_WAIT_TIME=300000  # 5 minutes

# Queue Settings
QUEUE_TIMEOUT=600000  # 10 minutes
QUEUE_MAX_SIZE=1000
```

## Debugging Commands

```bash
# View service logs
docker-compose logs -f matchmaking-service

# Check health
curl http://localhost:3002/health

# Check queue status
curl http://localhost:3002/queue/status

# View active scrims
curl http://localhost:3002/scrim/active

# Check RabbitMQ queues
docker-compose exec rabbitmq rabbitmq-diagnostics list_queues

# Check Redis cache
docker-compose exec redis redis-cli
```

## Common Tasks

### Adding a New Queue Type

1. Define queue entity: `src/queue/entities/queue-type.entity.ts`
2. Add queue configuration
3. Implement queue-specific matching logic
4. Add queue management endpoints
5. Add tests

### Tuning Matchmaking Algorithm

1. Analyze historical match data
2. Adjust parameters in config
3. Test with replay data
4. Deploy to staging
5. Monitor match quality metrics
6. Gradual rollout to production

### Adding New Scrim State

1. Update `ScrimState` enum
2. Update state machine transitions
3. Add state-specific logic
4. Update database migration
5. Add state transition tests

## Testing Requirements

### For Algorithm Changes
- [ ] Unit tests for matching logic
- [ ] Performance benchmarks
- [ ] Historical data validation
- [ ] Edge case coverage

### For State Machine Changes
- [ ] All transitions tested
- [ ] Invalid transitions throw errors
- [ ] State persistence verified

### For Queue Operations
- [ ] Concurrent access tested
- [ ] Transaction rollback tested
- [ ] Timeout handling tested

## Related Documentation

- **Root AGENTS.md:** `../../AGENTS.md`
- **Task Protocol:** `../../reports/agent-task-protocol.md`
- **Harness Charter:** `../../reports/agent-harness-charter.md`
- **Local Runtime:** `../../reports/agent-harness-local-runtime.md`
- **Service Manifest:** `../../scripts/harness/service-manifest.json`
