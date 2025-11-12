# Matchmaking Service - Core Functional Requirements

## Purpose
Manage competitive matchmaking for players, including skill-based matching, queue management, and scrim (practice match) organization.

## Core Functional Requirements

### 1. Player Matchmaking
- **Input**: Player ID, skill rating, game mode preferences
- **Processing**: Find suitable opponents based on skill level and availability
- **Output**: Matched players/teams for competitive play
- **Skill Matching**: Balance teams based on player skill ratings

### 2. Scrim Management
- **Scrim Creation**: Create practice matches with configurable settings
- **Player Invitations**: Invite players to join scrims
- **Scrim Status**: Track scrim lifecycle (pending, active, completed)
- **Settings Management**: Configure scrim rules, maps, and parameters

### 3. Queue Management
- **Queue Entry**: Add players to matchmaking queues
- **Queue Status**: Track player position and estimated wait time
- **Queue Exit**: Remove players from queues (voluntary or timeout)
- **Multiple Queues**: Support different game modes and skill brackets

### 4. Timeout Handling
- **Pending Timeout**: Auto-cancel scrims that remain pending too long
- **Popped Timeout**: Handle scrims that don't start after being matched
- **Queue Timeout**: Remove inactive players from queues
- **Grace Periods**: Configurable timeout durations

## Data Requirements

### Player Data Structure
```typescript
interface Player {
  id: string;
  name: string;
  skillRating: number;
  rank: string;
  gamePreferences: {
    modes: string[];
    regions: string[];
  };
  queueStatus: 'idle' | 'queued' | 'in-scrim';
}
```

### Scrim Data Structure
```typescript
interface Scrim {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  gameMode: string;
  skillBracket: string;
  players: Player[];
  maxPlayers: number;
  settings: ScrimSettings;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

### Queue Data Structure
```typescript
interface QueueEntry {
  playerId: string;
  gameMode: string;
  skillRating: number;
  enteredAt: Date;
  estimatedWaitTime: number;
}
```

## Business Logic Requirements

### Matchmaking Algorithm
- **Skill-Based Matching**: Match players within acceptable skill range
- **Wait Time Balance**: Balance skill accuracy vs. wait time
- **Geographic Preference**: Consider player location for latency
- **Game Mode Matching**: Match players for specific game modes

### Scrim Lifecycle
1. **Creation**: Player creates scrim with settings
2. **Invitation**: Players invited or join scrim
3. **Pending**: Wait for required number of players
4. **Active**: Scrim starts and gameplay begins
5. **Completion**: Scrim ends and results recorded

### Timeout Management
- **Pending Scrim Timeout**: Cancel scrims pending > X minutes
- **Popped Scrim Timeout**: Cancel scrims not started > Y minutes
- **Queue Timeout**: Remove players idle > Z minutes
- **Configurable Durations**: Admin-configurable timeout values

## Integration Points

### Database Integration
- **Player Storage**: Store player profiles and skill ratings
- **Scrim History**: Track scrim results and statistics
- **Queue State**: Maintain current queue state
- **Match Records**: Store completed match information

### Real-time Updates
- **Queue Status**: Notify players of queue position changes
- **Scrim Updates**: Notify players of scrim status changes
- **Match Found**: Notify players when match is found
- **Timeout Warnings**: Warn players before timeouts occur

## Error Handling Requirements

### Validation Errors
- **Invalid Player**: Handle non-existent or banned players
- **Invalid Settings**: Validate scrim configuration parameters
- **Skill Mismatch**: Handle extreme skill rating differences
- **Capacity Limits**: Enforce maximum queue/scrim sizes

### Processing Errors
- **Matchmaking Failures**: Handle cases where no suitable match found
- **Scrim Creation Failures**: Handle scrim creation errors
- **Player State Conflicts**: Handle players in multiple queues/scrims
- **Concurrent Updates**: Handle race conditions in state updates

## Performance Requirements

### Response Times
- **Queue Entry**: < 200ms to add player to queue
- **Matchmaking**: < 5s to find initial matches
- **Scrim Creation**: < 500ms to create new scrim
- **Status Updates**: < 100ms for state changes

### Scalability
- **Concurrent Players**: Support hundreds of concurrent players
- **Queue Capacity**: Handle thousands of queue entries
- **Scrim Volume**: Support dozens of active scrims
- **Match Rate**: Process matches at sustainable rate

## Security Requirements

### Access Control
- **Player Authentication**: Verify player identity
- **Scrim Permissions**: Control who can create/join scrims
- **Queue Restrictions**: Enforce rank/mode restrictions
- **Rate Limiting**: Prevent abuse of matchmaking system

### Data Protection
- **Skill Rating Privacy**: Protect sensitive player data
- **Match History**: Secure access to match records
- **Player State**: Prevent unauthorized state changes
- **Audit Logging**: Log important state changes

## Testing Requirements

### Unit Tests
- **Matchmaking Logic**: Test skill-based matching algorithms
- **Scrim State Machine**: Test scrim lifecycle transitions
- **Timeout Logic**: Test timeout handling and cleanup
- **Validation Rules**: Test input validation logic

### Integration Tests
- **Database Operations**: Test database integration
- **Concurrent Operations**: Test race condition handling
- **Performance Tests**: Test under load conditions
- **End-to-End Tests**: Test complete matchmaking workflows

## Migration Considerations

### Database Schema
- **Players Table**: Store player profiles and skill ratings
- **Scrims Table**: Store scrim information and status
- **Queue Table**: Store current queue state
- **Match History**: Store completed match records

### Code Organization
- **Service Layer**: Business logic for matchmaking and scrim management
- **Repository Layer**: Database access for players, scrims, and queues
- **Controller Layer**: API endpoints for matchmaking operations
- **Background Jobs**: Handle timeout and cleanup tasks

### Configuration
- **Matchmaking Rules**: Configure skill matching parameters
- **Timeout Settings**: Configure timeout durations
- **Queue Settings**: Configure queue behavior and limits
- **Game Mode Settings**: Configure available game modes

This focused documentation captures the essential matchmaking functionality that needs to be integrated into the monolithic backend, emphasizing player matching, scrim management, and queue operations without microservice-specific implementation details.