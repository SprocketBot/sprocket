# Queue Management Service

The Queue Management Service provides skill-based matchmaking functionality for competitive gaming, replacing the previous Redis-based implementation with PostgreSQL for better data integrity and consistency.

## Overview

This service manages:
- Player queueing with skill rating
- Skill-based matchmaking algorithm
- Queue state management (QUEUED, MATCHED, EXPIRED, CANCELLED)
- Automatic matchmaking and scrim creation
- Queue expiration and cleanup
- Real-time queue statistics

## Architecture

### Database Schema

The service uses two main tables:

#### `scrim_queue`
- Stores player queue entries
- Tracks queue status and timing
- Links to player, game, and match entities

#### `scrim_timeout`
- Manages player timeouts and cooldowns
- Prevents queue spam and abuse

### Key Components

1. **QueueService** - Core business logic for queue operations
2. **QueueWorker** - Background processing for matchmaking and cleanup
3. **QueueResolver** - GraphQL API endpoints
4. **QueueModule** - Dependency injection and module configuration

## Features

### Player Queueing
- Add players to queue with skill rating
- Prevent duplicate queue entries
- Check for active scrim conflicts
- Support for multiple games and skill groups

### Skill-Based Matchmaking
- Dynamic skill range expansion (100-500 points)
- Balanced team creation based on skill proximity
- Configurable match sizes and parameters
- Preserves existing game order generation

### Queue Management
- Real-time queue position tracking
- Queue statistics and analytics
- Automatic expiration handling
- Graceful cleanup and timeout management

### Integration
- GraphQL API for frontend integration
- Event publishing for real-time updates
- Observability with metrics and logging
- Transactional consistency with PostgreSQL

## API Reference

### GraphQL Mutations

#### `joinQueue`
```graphql
mutation {
  joinQueue(gameId: "game-123", skillRating: 1500)
}
```

#### `leaveQueue`
```graphql
mutation {
  leaveQueue
}
```

#### `processMatchmaking`
```graphql
mutation {
  processMatchmaking {
    scrimId
    playerIds
    gameId
    skillRating
  }
}
```

### GraphQL Queries

#### `getQueueStatus`
```graphql
query {
  getQueueStatus {
    playerId
    gameId
    skillRating
    queuedAt
    position
  }
}
```

#### `getQueueStats`
```graphql
query {
  getQueueStats(gameId: "game-123") {
    totalQueued
    averageWaitTime
    gameStats {
      gameId
      queuedCount
    }
  }
}
```

## Configuration

### Environment Variables
- `QUEUE_TIMEOUT_MS` - Queue entry timeout (default: 10 minutes)
- `MATCHMAKING_INTERVAL_MS` - Matchmaking processing interval (default: 5 seconds)
- `SKILL_RANGE_INITIAL` - Initial skill matching range (default: 100)
- `SKILL_RANGE_MAX` - Maximum skill matching range (default: 500)

### Cron Jobs
- **Every 30 seconds**: Process matchmaking
- **Every 5 minutes**: Clean up expired queues
- **Every minute**: Record queue metrics

## Matchmaking Algorithm

The matchmaking algorithm works as follows:

1. **Group by Game**: Process queues separately for each game
2. **Sort by Skill**: Order players by skill rating
3. **Skill Range Matching**: Start with narrow skill range (100 points)
4. **Progressive Expansion**: Increase range by 50 points if no matches found
5. **Team Creation**: Create balanced teams from matched players
6. **Scrim Generation**: Create scrims with optimal player combinations

### Example Flow
```
Players: [1400, 1450, 1500, 1550, 1600, 1650]
Skill Range: 100 → 150 → 200 → 250 → 300
Matches: [1400,1450], [1500,1550], [1600,1650]
```

## Observability

### Metrics
- `queue.join` - Player joins queue
- `queue.leave` - Player leaves queue
- `queue.match.created` - Successful match creation
- `queue.matchmaking.duration` - Matchmaking processing time
- `queue.expired` - Expired queue entries
- `queue.size` - Current queue size
- `queue.wait_time` - Average wait time

### Logging
- Player queue operations
- Matchmaking results
- Error conditions and failures
- Performance metrics

## Error Handling

### Validation Errors
- Player already in queue
- Player in active scrim
- Invalid game or skill group
- Queue capacity limits

### Processing Errors
- Database connection issues
- Matchmaking algorithm failures
- Scrim creation errors
- Event publishing failures

## Testing

### Unit Tests
```bash
npm test queue.service.spec.ts
```

### Integration Tests
Use the provided integration test helper:
```typescript
const queueTest = new QueueIntegrationTest(queueService, scrimService);
await queueTest.runBasicTest();
await queueTest.runMatchmakingTest();
await queueTest.runCleanupTest();
```

### Manual Testing
1. Start the application
2. Use GraphQL playground at `/graphql`
3. Test queue operations with real data
4. Verify matchmaking creates scrims
5. Check queue cleanup functionality

## Migration from Redis

This implementation replaces the previous Redis-based queue system with PostgreSQL, providing:

- **Better Data Integrity**: ACID transactions and foreign key constraints
- **Simplified Architecture**: Single database instead of Redis + PostgreSQL
- **Improved Observability**: Built-in metrics and logging
- **Easier Maintenance**: Standard SQL queries and TypeORM integration

## Performance Considerations

- Database indexes on `playerId`, `gameId`, `status`, and `queuedAt`
- Efficient queries with proper joins and filtering
- Background processing to avoid blocking operations
- Configurable cron intervals for different load patterns

## Future Enhancements

- Geographic preference matching
- Party/team queue support
- Advanced skill balancing algorithms
- Machine learning for wait time prediction
- Real-time queue position updates via WebSocket