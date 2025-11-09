# Matchmaking Service

## Overview
The Matchmaking Service is a sophisticated NestJS-based microservice that manages competitive matchmaking for Rocket League tournaments and scrims. It handles player queueing, team formation, match creation, and lifecycle management with real-time state tracking and timeout handling.

## Architecture
- **Framework**: NestJS with TypeScript
- **Transport**: RabbitMQ (RMQ)
- **Queue Management**: BullMQ for job processing
- **State Management**: Redis for distributed state
- **Communication**: gRPC-style message patterns with timeout handling

## Core Functionality

### Scrim Management
The service manages competitive matches called "scrims" with the following capabilities:

- **Scrim Creation**: Create new scrims with specific game modes and settings
- **Player Queueing**: Handle player joining and leaving scrims
- **Team Formation**: Automatically form balanced teams
- **State Management**: Track scrim lifecycle from pending to completion
- **Timeout Handling**: Automatic timeout for pending and popped scrims

### Key Components

#### MatchmakingService
- **Client Interface**: Provides clean API for other services to interact with
- **Timeout Handling**: 2-second timeout for all operations
- **Error Handling**: Comprehensive error propagation and logging
- **State Validation**: Ensures data consistency across operations

#### ScrimService & ScrimCrudService
- **Scrim Lifecycle**: Manages scrim creation, updates, and deletion
- **Player Management**: Handles player joining/leaving scrims
- **State Transitions**: Manages scrim state changes (pending, popped, in-progress, complete)
- **Validation**: Ensures scrim data integrity

#### Timeout Processors
- **ScrimPendingTimeoutProcessor**: Handles timeout for scrims in pending state
- **ScrimPoppedTimeoutProcessor**: Handles timeout for scrims that have been "popped" (teams formed)
- **Queue Management**: Uses BullMQ for reliable job processing
- **Redis Integration**: Stores timeout jobs in Redis

## Data Models

### Scrim
```typescript
interface Scrim {
  id: string;
  gameModeId: number;
  skillGroupId: number;
  status: ScrimState;
  players: Player[];
  teams?: Team[];
  settings: ScrimSettings;
  createdAt: Date;
  updatedAt: Date;
}
```

### Scrim States
- **Pending**: Waiting for enough players to join
- **Popped**: Teams have been formed, waiting for match to start
- **In Progress**: Match is currently being played
- **Complete**: Match has finished

## API Endpoints

### Scrim Operations
- **List Scrims**: Retrieve all available scrims
- **Create Scrim**: Create a new scrim with specified parameters
- **Join Scrim**: Add a player to an existing scrim
- **Leave Scrim**: Remove a player from a scrim
- **Get Scrim for User**: Retrieve the scrim a specific user is in
- **Get Scrim Pending TTL**: Get time-to-live for pending scrim

## Configuration

### Queue Configuration
- **Scrim Pending Timeout Queue**: Handles pending scrim timeouts
- **Scrim Popped Timeout Queue**: Handles popped scrim timeouts
- **Redis Connection**: Host and port configuration for Redis

### Timeout Settings
- **Pending Timeout**: Configurable timeout for scrims in pending state
- **Popped Timeout**: Configurable timeout for scrims after team formation

## Data Flow

1. **Scrim Creation**: Creates new scrim with initial state
2. **Player Joining**: Players join scrim, state updates to pending
3. **Team Formation**: When enough players join, teams are automatically formed
4. **State Transitions**: Scrim moves through various states based on player actions and timeouts
5. **Completion**: Scrim completes when match finishes or times out

## Timeout Management
- **Automatic Timeouts**: Scrims automatically timeout if not enough players join
- **State-based Timeouts**: Different timeout periods for different scrim states
- **Job Processing**: Uses BullMQ workers for reliable timeout handling
- **Redis Persistence**: Timeout jobs persisted in Redis for reliability

## Error Handling
- **Timeout Protection**: All operations have 2-second timeout protection
- **State Validation**: Ensures scrim state transitions are valid
- **Error Propagation**: Proper error handling and logging
- **Rollback Support**: Ability to revert invalid state changes

## Performance Considerations
- **Redis Caching**: Fast state retrieval and updates
- **Queue Processing**: Asynchronous job processing for timeouts
- **Connection Pooling**: Efficient Redis connection management
- **Load Balancing**: Multiple workers can process timeout jobs

## Security Features
- **Input Validation**: Validates all incoming requests
- **State Authorization**: Ensures only authorized state transitions
- **Rate Limiting**: Prevents abuse through queue management

## Integration Points
- **Redis**: For state management and job queuing
- **RabbitMQ**: For inter-service communication
- **Common Library**: Shared types and utilities from `@sprocketbot/lib`

## Deployment
- **Container**: Docker-based deployment
- **Scalability**: Horizontal scaling through Redis clustering
- **Monitoring**: Health checks and metrics collection
- **Queue Workers**: Multiple workers for job processing

## Testing
- **Unit Tests**: Individual service testing
- **Integration Tests**: Redis and queue integration testing
- **Timeout Testing**: Specific timeout scenario testing
- **Load Testing**: Performance under high load conditions

This service is critical for managing the competitive matchmaking experience, ensuring fair team formation, proper state management, and reliable timeout handling for Rocket League tournaments and scrims within the Sprocket platform.