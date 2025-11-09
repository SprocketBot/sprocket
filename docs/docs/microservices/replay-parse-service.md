# Replay Parse Service

## Overview
The Replay Parse Service is a Python-based microservice that processes Rocket League replay files to extract game statistics and analytics. It integrates with the Ballchasing API for replay parsing and provides a robust, scalable solution for handling replay analysis with caching, progress tracking, and comprehensive error handling.

## Architecture
- **Language**: Python 3.x
- **Task Queue**: Celery with Redis backend
- **Storage**: MinIO for file storage
- **API Integration**: Ballchasing API for replay parsing
- **Communication**: RabbitMQ for message-based communication
- **Analytics**: Built-in analytics and progress tracking

## Core Functionality

### Replay Processing Pipeline
The service provides a complete replay processing workflow:

- **File Retrieval**: Downloads replay files from MinIO storage
- **API Integration**: Uploads to Ballchasing API for parsing
- **Progress Tracking**: Real-time progress updates via RabbitMQ
- **Result Caching**: Caches parsed results in MinIO to avoid reprocessing
- **Analytics Collection**: Comprehensive timing and performance metrics

### Key Components

#### ParseReplay Task
- **Celery Task**: Main task for replay processing
- **Progress Updates**: Sends progress messages via RabbitMQ
- **Error Handling**: Comprehensive error handling with retry logic
- **Caching**: Checks for existing parsed results before processing
- **Analytics**: Collects performance metrics throughout the process

#### Ballchasing API Integration
- **Upload Handling**: Manages replay upload with retry logic
- **Rate Limit Handling**: Handles API rate limits gracefully
- **Status Monitoring**: Monitors parsing status (pending, failed, ok)
- **Duplicate Detection**: Handles already-uploaded replays
- **Backoff Strategy**: Exponential backoff for retries

#### Analytics System
- **Timing Metrics**: Tracks get, parse, and put operations
- **Performance Monitoring**: Measures replay size and processing time
- **Success Tracking**: Monitors success/failure rates
- **Cache Hit Tracking**: Tracks cache utilization

## Data Flow

1. **Task Initiation**: Receives replay processing request via Celery
2. **Cache Check**: Checks if replay has already been processed
3. **File Retrieval**: Downloads replay file from MinIO
4. **API Upload**: Uploads replay to Ballchasing API with retries
5. **Status Monitoring**: Monitors parsing status with progress updates
6. **Result Retrieval**: Downloads parsed statistics when ready
7. **Storage**: Uploads results to MinIO for future use
8. **Analytics**: Sends performance metrics to analytics queue

## Configuration

### Service Configuration
```json
{
  "celery": {
    "broker": "redis://redis:6379/0",
    "backend": "redis://redis:6379/0",
    "queue": "replay-parse"
  },
  "transport": {
    "url": "amqp://rabbitmq:5672",
    "analytics_queue": "analytics"
  },
  "minio": {
    "hostname": "minio:9000",
    "bucket": "replays",
    "parsed_object_prefix": "parsed"
  },
  "ballchasing": {
    "maxRetries": 4,
    "backoffFactor": 4
  },
  "parser": "ballchasing",
  "disableCache": false
}
```

## API Integration Details

### Ballchasing API
- **Token Management**: Reads API token from secret file
- **Rate Limiting**: Handles 429 responses with retry logic
- **Status Codes**: 
  - `200`: Successful parsing
  - `400`: Failed replay (bad format)
  - `409`: Duplicate replay (already uploaded)
  - `429`: Rate limited
- **Retry Logic**: Up to 4 retries with exponential backoff

### Upload Process
1. **Initial Upload**: Attempts to upload replay file
2. **Duplicate Handling**: If duplicate detected, uses existing ID
3. **Failed Handling**: If replay is invalid, fails immediately
4. **Rate Limit Handling**: Waits and retries on rate limits

### Status Monitoring
1. **Pending Status**: Replay is being processed by Ballchasing
2. **Failed Status**: Replay could not be parsed
3. **OK Status**: Replay successfully parsed and ready

## Progress Tracking

### Progress Updates
- **Task Start**: "Task started..." (10%)
- **File Download**: "Fetching replay..." (20%)
- **API Upload**: "Uploading replay to Ballchasing" (varies)
- **API Processing**: "Getting stats from Ballchasing" (varies)
- **Completion**: "Complete!" (100%)

### Progress Queue
- **Real-time Updates**: Sends progress messages to specified queue
- **Error Handling**: Sends error messages on failure
- **Completion**: Sends final result on successful completion

## Analytics Collection

### Metrics Tracked
- **Task ID**: Unique identifier for tracking
- **Success Rate**: Percentage of successful parses
- **Cache Hit Rate**: Percentage of cached vs. processed replays
- **Replay Size**: Size of replay files in kilobytes
- **Timing Metrics**:
  - **Get Time**: Time to download replay from MinIO
  - **Parse Time**: Time to parse replay via API
  - **Put Time**: Time to upload results to MinIO
  - **Total Time**: Total processing time

### Analytics Format
```json
{
  "pattern": "analytics",
  "data": {
    "name": "parseReplay",
    "tags": [["taskId", "..."], ["hash", "..."], ["parser", "ballchasing"]],
    "booleans": [["success", true], ["cached", false]],
    "ints": [["getMs", 123], ["parseMs", 456], ["putMs", 78], ["totalMs", 657], ["replayKb", 1024]]
  }
}
```

## Error Handling

### Retry Strategy
- **Max Retries**: 4 attempts for API operations
- **Backoff Factor**: Exponential backoff with factor of 4
- **Delay Calculation**: Delays of [0, 4, 16, 64] seconds
- **Total Delay**: Up to 84 seconds maximum delay

### Error Types
- **Network Errors**: Connection failures, timeouts
- **API Errors**: Rate limiting, invalid replays
- **Storage Errors**: MinIO upload/download failures
- **Parsing Errors**: Invalid replay format, corrupted files

### Error Recovery
- **Automatic Retry**: Most errors trigger retry logic
- **Graceful Degradation**: Continues processing on non-critical errors
- **Progress Updates**: Sends error status via progress queue
- **Analytics**: Records failure metrics for monitoring

## Performance Considerations

### Caching Strategy
- **Result Caching**: Parsed results stored in MinIO
- **Cache Key**: Based on replay file hash
- **Cache Bypass**: Option to disable caching for testing
- **Cache Validation**: Checks cache before processing

### Concurrency
- **Celery Workers**: Multiple workers for parallel processing
- **Rate Limiting**: Respects Ballchasing API rate limits
- **Queue Management**: Efficient task distribution

### Resource Management
- **Temporary Files**: Automatic cleanup of downloaded files
- **Memory Management**: Efficient handling of large replay files
- **Connection Pooling**: Reuses connections where possible

## Security Features

### API Security
- **Token Management**: Secure storage of Ballchasing API token
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Input Validation**: Validates replay file formats

### Data Protection
- **File Encryption**: Replays stored securely in MinIO
- **Access Control**: Proper access permissions for storage
- **Audit Trail**: Complete logging of all operations

## Integration Points

### External Services
- **Ballchasing API**: Primary parsing service
- **MinIO**: File storage and retrieval
- **RabbitMQ**: Progress updates and analytics
- **Redis**: Celery task queue backend

### Internal Dependencies
- **Celery**: Task queue management
- **python-ballchasing**: Ballchasing API client
- **minio-py**: MinIO client library

## Deployment Considerations

### Scaling
- **Horizontal Scaling**: Multiple Celery workers
- **Load Balancing**: Distribute tasks across workers
- **Resource Monitoring**: Monitor CPU and memory usage

### Monitoring
- **Analytics Metrics**: Comprehensive performance metrics
- **Error Tracking**: Detailed error logging and tracking
- **Health Checks**: Service health monitoring

This service is essential for processing Rocket League replays to extract game statistics, enabling detailed match analysis, player performance tracking, and competitive statistics within the Sprocket platform.