# Queue Management System - Manual Testing Guide

This document provides step-by-step manual testing procedures for the Queue Management System GraphQL endpoints.

## Prerequisites

1. Core service is running (`npm run start:dev` in core directory)
2. Database is properly migrated and seeded
3. GraphQL Playground is accessible at `http://localhost:3000/graphql`

## Test Environment Setup

### 1. Create Test Data

First, let's create some test data using GraphQL mutations:

```graphql
# Create test games
mutation CreateGame {
  createGame(data: { name: "Rocket League" }) {
    id
    name
  }
}

mutation CreateGame2 {
  createGame(data: { name: "League of Legends" }) {
    id
    name
  }
}
```

### 2. Create Test Users and Players

```graphql
# Create test users (you'll need to authenticate first)
mutation CreateUser {
  createUser(data: { username: "testuser1" }) {
    id
    username
  }
}

mutation CreateUser2 {
  createUser(data: { username: "testuser2" }) {
    id
    username
  }
}
```

## Test Scenarios

### Scenario 1: Single Player Queue Operations

#### 1.1 Join Queue
```graphql
mutation JoinQueue {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}
```

**Expected Response:**
```json
{
  "data": {
    "joinQueue": true
  }
}
```

#### 1.2 Check Queue Status
```graphql
query GetQueueStatus {
  getQueueStatus {
    playerId
    gameId
    skillRating
    queuedAt
    position
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getQueueStatus": {
      "playerId": "your-player-id",
      "gameId": "your-game-id",
      "skillRating": 1500,
      "queuedAt": "2023-01-01T12:00:00.000Z",
      "position": 1
    }
  }
}
```

#### 1.3 Check Queue Statistics
```graphql
query GetQueueStats {
  getQueueStats {
    totalQueued
    averageWaitTime
    gameStats {
      gameId
      queuedCount
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getQueueStats": {
      "totalQueued": 1,
      "averageWaitTime": 0,
      "gameStats": [
        {
          "gameId": "your-game-id",
          "queuedCount": 1
        }
      ]
    }
  }
}
```

#### 1.4 Leave Queue
```graphql
mutation LeaveQueue {
  leaveQueue
}
```

**Expected Response:**
```json
{
  "data": {
    "leaveQueue": true
  }
}
```

#### 1.5 Verify Queue Status After Leaving
```graphql
query GetQueueStatus {
  getQueueStatus {
    playerId
    gameId
    skillRating
    queuedAt
    position
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getQueueStatus": null
  }
}
```

### Scenario 2: Multi-Player Queue Operations

#### 2.1 Create Multiple Players in Queue
First, create multiple players and join them to the queue:

```graphql
# Player 1
mutation JoinPlayer1 {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}

# Player 2
mutation JoinPlayer2 {
  joinQueue(gameId: "your-game-id", skillRating: 1550)
}

# Player 3
mutation JoinPlayer3 {
  joinQueue(gameId: "your-game-id", skillRating: 1600)
}
```

#### 2.2 Check Queue Status for Each Player
Switch authentication between players and check their status:

```graphql
query GetQueueStatus {
  getQueueStatus {
    playerId
    gameId
    skillRating
    queuedAt
    position
  }
}
```

**Expected Results:**
- Player 1: position 1
- Player 2: position 2
- Player 3: position 3

#### 2.3 Check Updated Queue Statistics
```graphql
query GetQueueStats {
  getQueueStats(gameId: "your-game-id") {
    totalQueued
    averageWaitTime
    gameStats {
      gameId
      queuedCount
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getQueueStats": {
      "totalQueued": 3,
      "averageWaitTime": 30000,
      "gameStats": [
        {
          "gameId": "your-game-id",
          "queuedCount": 3
        }
      ]
    }
  }
}
```

### Scenario 3: Matchmaking Process

#### 3.1 Create Players for Matchmaking
Create players with compatible skill ratings:

```graphql
# Player with skill 1500
mutation JoinForMatchmaking1 {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}

# Player with skill 1525
mutation JoinForMatchmaking2 {
  joinQueue(gameId: "your-game-id", skillRating: 1525)
}

# Player with skill 1550
mutation JoinForMatchmaking3 {
  joinQueue(gameId: "your-game-id", skillRating: 1550)
}

# Player with skill 1575
mutation JoinForMatchmaking4 {
  joinQueue(gameId: "your-game-id", skillRating: 1575)
}
```

#### 3.2 Process Matchmaking
```graphql
mutation ProcessMatchmaking {
  processMatchmaking {
    scrimId
    playerIds
    gameId
    skillRating
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "processMatchmaking": [
      {
        "scrimId": "generated-scrim-id",
        "playerIds": ["player-id-1", "player-id-2"],
        "gameId": "your-game-id",
        "skillRating": 1512
      },
      {
        "scrimId": "generated-scrim-id-2",
        "playerIds": ["player-id-3", "player-id-4"],
        "gameId": "your-game-id",
        "skillRating": 1562
      }
    ]
  }
}
```

### Scenario 4: Error Handling

#### 4.1 Try to Join Queue Twice (Same Player)
```graphql
# First join (should succeed)
mutation FirstJoin {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}

# Second join (should fail)
mutation SecondJoin {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}
```

**Expected Error Response:**
```json
{
  "errors": [
    {
      "message": "Failed to join queue: Player is already in queue"
    }
  ]
}
```

#### 4.2 Try to Leave Queue When Not in Queue
```graphql
mutation LeaveWithoutJoining {
  leaveQueue
}
```

**Expected Error Response:**
```json
{
  "errors": [
    {
      "message": "Failed to leave queue: Player is not in queue"
    }
  ]
}
```

#### 4.3 Try to Join Queue Without Authentication
```graphql
mutation JoinWithoutAuth {
  joinQueue(gameId: "your-game-id", skillRating: 1500)
}
```

**Expected Error Response:**
```json
{
  "errors": [
    {
      "message": "Unauthorized"
    }
  ]
}
```

### Scenario 5: Concurrent Operations

#### 5.1 Concurrent Join Requests
Create multiple players and have them join the queue simultaneously:

```bash
# Run these commands simultaneously in different terminals or use a script
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer player1-token" \
  -d '{"query": "mutation { joinQueue(gameId: \"game-id\", skillRating: 1500) }"}'

curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer player2-token" \
  -d '{"query": "mutation { joinQueue(gameId: \"game-id\", skillRating: 1550) }"}'

curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer player3-token" \
  -d '{"query": "mutation { joinQueue(gameId: \"game-id\", skillRating: 1600) }"}'
```

**Expected Results:**
- All requests should succeed
- Players should be added to queue in order
- Queue positions should be assigned correctly

#### 5.2 Concurrent Status Checks
```bash
# Check status for multiple players concurrently
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer player1-token" \
  -d '{"query": "query { getQueueStatus { playerId gameId skillRating position } }"}'

curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer player2-token" \
  -d '{"query": "query { getQueueStatus { playerId gameId skillRating position } }"}'
```

### Scenario 6: Performance Testing

#### 6.1 Large Queue Test
Create a script to add many players to the queue:

```bash
#!/bin/bash
GAME_ID="your-game-id"
for i in {1..100}; do
  curl -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token-$i" \
    -d "{\"query\": \"mutation { joinQueue(gameId: \\\"$GAME_ID\\\", skillRating: $((1500 + i))) }\"}"
done
```

Then check the queue statistics:
```graphql
query LargeQueueStats {
  getQueueStats {
    totalQueued
    averageWaitTime
    gameStats {
      gameId
      queuedCount
    }
  }
}
```

**Expected Results:**
- totalQueued should be 100
- averageWaitTime should be reasonable (under 1 minute)
- Response time should be fast (under 1 second)

## Test Scripts

### Basic Test Script
```bash
#!/bin/bash
echo "=== Queue Management System Manual Test ==="

# Test join queue
echo "1. Testing join queue..."
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{"query": "mutation { joinQueue(gameId: \"test-game\", skillRating: 1500) }"}'

# Test queue status
echo "2. Testing queue status..."
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{"query": "query { getQueueStatus { playerId gameId skillRating position } }"}'

# Test queue stats
echo "3. Testing queue stats..."
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getQueueStats { totalQueued averageWaitTime gameStats { gameId queuedCount } } }"}'

# Test leave queue
echo "4. Testing leave queue..."
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{"query": "mutation { leaveQueue }"}'

echo "=== Test Complete ==="
```

### Advanced Test Script with Multiple Players
```bash
#!/bin/bash
echo "=== Multi-Player Queue Test ==="

# Create multiple players
for i in {1..5}; do
  echo "Creating player $i..."
  curl -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token-$i" \
    -d "{\"query\": \"mutation { joinQueue(gameId: \\\"test-game\\\", skillRating: $((1500 + i * 10))) }\"}"
  sleep 0.1
done

# Check final queue stats
echo "Final queue stats:"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getQueueStats { totalQueued gameStats { gameId queuedCount } } }"}'

echo "=== Multi-Player Test Complete ==="
```

## Expected Behavior Summary

| Operation | Expected Result | Error Conditions |
|-----------|----------------|------------------|
| joinQueue | Returns `true` | Already in queue, invalid game ID, no auth |
| leaveQueue | Returns `true` | Not in queue, no auth |
| getQueueStatus | Returns queue status or `null` | No auth |
| getQueueStats | Returns queue statistics | None |
| processMatchmaking | Returns matchmaking results | No auth |

## Common Issues and Solutions

### Issue 1: "Player is already in queue"
**Solution:** Call `leaveQueue` first, then `joinQueue` again.

### Issue 2: "Unauthorized" error
**Solution:** Ensure you have a valid authentication token in the request headers.

### Issue 3: Slow response times
**Solution:** Check database connection and consider adding indexes to queue tables.

### Issue 4: Matchmaking not finding matches
**Solution:** Ensure you have enough players (minimum 2) with compatible skill ratings.

## Performance Benchmarks

| Operation | Expected Response Time | Max Players |
|-----------|----------------------|-------------|
| joinQueue | < 500ms | 1000 |
| leaveQueue | < 300ms | 1000 |
| getQueueStatus | < 200ms | 1000 |
| getQueueStats | < 1s | 1000 |
| processMatchmaking | < 2s | 100 |

## Conclusion

This manual testing guide provides comprehensive test scenarios for the Queue Management System. Run these tests regularly to ensure system reliability and performance.