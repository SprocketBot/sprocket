# Replay Parse Service - Core Functional Requirements

## Purpose
Process Rocket League replay files to extract game statistics, player performance data, and match analytics for competitive analysis and record keeping.

## Core Functional Requirements

### 1. Replay File Validation
- **Input**: Replay file binary data
- **Processing**: Validate file format, integrity, and completeness
- **Output**: Validation result with error details if invalid
- **Format Support**: Support standard Rocket League replay format (.replay files)

### 2. Replay Parsing
- **Input**: Validated replay file
- **Processing**: Extract game data, player statistics, and match events
- **Output**: Structured match data with comprehensive statistics
- **Data Extraction**: Parse goals, saves, shots, assists, and other game events

### 3. External API Integration
- **Input**: Replay file for processing
- **Processing**: Upload to external parsing service (Ballchasing API)
- **Output**: Parsed match statistics and analytics
- **Fallback**: Handle API failures with appropriate error responses

### 4. Result Processing
- **Input**: Raw parsed data from external service
- **Processing**: Transform and normalize data to application format
- **Output**: Standardized match statistics suitable for storage and display
- **Data Mapping**: Map external API fields to internal data structure

## Data Requirements

### Replay File Structure
```typescript
interface ReplayFile {
  filename: string;
  filehash: string;
  filesize: number;
  content: Buffer;
  uploadedBy: string;
  uploadedAt: Date;
}
```

### Parsed Match Data Structure
```typescript
interface ParsedMatch {
  matchId: string;
  duration: number;
  date: Date;
  gameMode: string;
  map: string;
  
  teams: Array<{
    name: string;
    color: string;
    score: number;
    players: PlayerStats[];
  }>;
  
  players: PlayerStats[];
  
  events: Array<{
    type: 'goal' | 'save' | 'shot' | 'assist';
    time: number;
    player: string;
    team: string;
  }>;
}
```

### Player Statistics Structure
```typescript
interface PlayerStats {
  playerId: string;
  playerName: string;
  team: string;
  
  // Core stats
  score: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
  
  // Advanced stats
  shootingPercentage: number;
  savePercentage: number;
  scorePerMinute: number;
  
  // Performance metrics
  possessionTime: number;
  boostUsage: number;
  distanceTraveled: number;
  
  // Position data
  averagePosition: {
    x: number;
    y: number;
    z: number;
  };
}
```

## Business Logic Requirements

### File Validation Logic
- **Format Validation**: Verify file is valid Rocket League replay format
- **Integrity Check**: Verify file is not corrupted or incomplete
- **Size Validation**: Enforce reasonable file size limits
- **Duplicate Detection**: Check if replay has already been processed

### Parsing Workflow
1. **File Upload**: Receive and store replay file
2. **Validation**: Validate replay file format and integrity
3. **API Upload**: Upload to external parsing service
4. **Status Monitoring**: Monitor parsing progress
5. **Result Retrieval**: Download parsed results when ready
6. **Data Transformation**: Convert to internal format
7. **Storage**: Store parsed results in database

### Data Transformation
- **Field Mapping**: Map external API fields to internal structure
- **Data Normalization**: Normalize data formats and units
- **Statistical Calculations**: Calculate derived statistics
- **Validation**: Validate transformed data completeness

## Integration Points

### Database Integration
- **Replay Storage**: Store replay file metadata and content
- **Parsed Data Storage**: Store parsed match statistics
- **Processing Status**: Track parsing status and history
- **Duplicate Prevention**: Prevent reprocessing of existing replays

### External Service Integration
- **API Authentication**: Handle authentication with external parsing service
- **Rate Limiting**: Respect API rate limits and quotas
- **Error Handling**: Handle API errors and service unavailability
- **Retry Logic**: Implement retry logic for transient failures

## Error Handling Requirements

### Validation Errors
- **Invalid Format**: Handle non-replay files or corrupted replays
- **File Size**: Handle files that exceed size limits
- **Duplicate Files**: Handle attempts to process already-processed replays
- **Missing Data**: Handle replays with incomplete or missing data

### Processing Errors
- **API Failures**: Handle external service failures
- **Network Issues**: Handle network connectivity problems
- **Timeout Errors**: Handle processing timeouts
- **Data Corruption**: Handle corrupted or invalid parsed data

### Recovery Strategies
- **Retry Attempts**: Configurable retry attempts for failed processing
- **Fallback Options**: Alternative parsing methods if primary fails
- **Error Reporting**: Detailed error reporting for debugging
- **Graceful Degradation**: Continue operation when individual replays fail

## Performance Requirements

### Processing Times
- **Validation**: < 1s for replay file validation
- **API Upload**: < 10s for upload to external service
- **Parsing**: < 60s for complete parsing process
- **Data Transformation**: < 5s for data transformation

### Throughput
- **Concurrent Processing**: Handle multiple replays simultaneously
- **Queue Management**: Manage processing queue efficiently
- **Resource Usage**: Efficient CPU and memory usage
- **Storage Efficiency**: Optimize storage for replay files and results

## Security Requirements

### File Security
- **File Validation**: Validate file content before processing
- **Size Limits**: Enforce reasonable file size limits
- **Type Restrictions**: Only accept valid replay file types
- **Malware Scanning**: Optional virus scanning for uploaded files

### Data Protection
- **Privacy**: Handle player data according to privacy regulations
- **Access Control**: Restrict access to parsed match data
- **Audit Logging**: Log replay processing for security audit
- **Data Retention**: Implement appropriate data retention policies

## Testing Requirements

### Unit Tests
- **File Validation**: Test replay file validation logic
- **Data Transformation**: Test data transformation and mapping
- **Error Handling**: Test error scenarios and recovery
- **API Integration**: Test external service integration

### Integration Tests
- **End-to-End Processing**: Test complete replay processing workflow
- **External Service Tests**: Test integration with parsing API
- **Database Tests**: Test data storage and retrieval
- **Performance Tests**: Test processing performance under load

## Migration Considerations

### Database Schema
- **Replay Files Table**: Store replay file metadata and content
- **Parsed Matches Table**: Store parsed match statistics
- **Processing Queue Table**: Track processing status and history
- **Player Stats Table**: Store individual player statistics

### Code Organization
- **Service Layer**: Business logic for replay processing
- **Repository Layer**: Database access for replays and parsed data
- **Integration Layer**: External service integration logic
- **Validation Layer**: File and data validation logic

### Configuration
- **External API**: Configure external parsing service credentials
- **Processing Limits**: Configure file size and processing limits
- **Retry Settings**: Configure retry attempts and timeouts
- **Storage Settings**: Configure replay file storage settings

This focused documentation captures the essential replay parsing functionality that needs to be integrated into the monolithic backend, emphasizing file processing, data extraction, and external API integration without microservice-specific implementation details.