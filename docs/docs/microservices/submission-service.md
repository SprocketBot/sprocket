# Submission Service

## Overview
The Submission Service is a NestJS-based microservice that manages the complete replay submission workflow for the Sprocket platform. It handles replay file uploads, validation, processing, and status tracking, providing a robust and scalable solution for managing Rocket League replay submissions with comprehensive error handling and progress tracking.

## Architecture
- **Language**: TypeScript with NestJS framework
- **Task Queue**: BullMQ with Redis backend
- **Storage**: MinIO for file storage
- **Communication**: RabbitMQ for message-based communication
- **Validation**: Runtime validation of replay files and metadata
- **Transport**: RabbitMQ transport for microservice communication

## Core Functionality

### Submission Workflow
The service provides a complete replay submission pipeline:

- **File Upload**: Handles replay file uploads with validation
- **Replay Validation**: Validates replay file format and integrity
- **Processing Pipeline**: Orchestrates replay processing workflow
- **Progress Tracking**: Real-time progress updates via RabbitMQ
- **Status Management**: Comprehensive status tracking throughout the process
- **Error Handling**: Robust error handling with detailed error reporting

### Key Components

#### Submission Controller
- **Message Handler**: Processes submission requests via RabbitMQ
- **Request Validation**: Validates incoming submission requests
- **Job Creation**: Creates BullMQ jobs for processing
- **Response Handling**: Returns job IDs and status information
- **Error Handling**: Handles validation and processing errors

#### Submission Service
- **Job Management**: Manages BullMQ job lifecycle
- **File Operations**: Handles file uploads to MinIO
- **Validation**: Comprehensive replay file validation
- **Progress Updates**: Sends progress updates via RabbitMQ
- **Status Tracking**: Tracks submission status throughout the process

#### Submission Processor
- **Job Processing**: Processes submission jobs from queue
- **Replay Validation**: Validates replay file format and metadata
- **Processing Orchestration**: Orchestrates the complete processing pipeline
- **Progress Reporting**: Reports progress at each stage
- **Error Recovery**: Handles processing errors with retry logic

## Data Flow

### Submission Process
1. **Request Initiation**: Receives submission request with replay file
2. **File Upload**: Uploads replay file to MinIO storage
3. **Job Creation**: Creates BullMQ job for processing
4. **Validation**: Validates replay file format and integrity
5. **Processing Pipeline**: Orchestrates replay processing workflow
6. **Progress Updates**: Sends real-time progress updates
7. **Completion**: Sends final completion status

### Processing Pipeline
1. **File Validation**: Validates replay file format
2. **Replay Parsing**: Sends replay to parsing service
3. **Data Processing**: Processes parsed replay data
4. **Result Storage**: Stores processing results
5. **Status Updates**: Updates submission status
6. **Notification**: Sends completion notifications

## Configuration

### Service Configuration
```json
{
  "transport": {
    "url": "amqp://rabbitmq:5672",
    "submission_queue": "submission"
  },
  "redis": {
    "host": "redis",
    "port": 6379
  },
  "bull": {
    "defaultJobOptions": {
      "removeOnComplete": 10,
      "removeOnFail": 5,
      "attempts": 3,
      "backoff": {
        "type": "exponential",
        "delay": 2000
      }
    }
  },
  "minio": {
    "hostname": "minio:9000",
    "bucket": "replays",
    "object_prefix": "replays"
  }
}
```

## Data Models

### Submission Request
```typescript
interface SubmissionRequest {
  file: Buffer;
  filename: string;
  filehash: string;
  playerId: number;
  submissionId: string;
}
```

### Submission Response
```typescript
interface SubmissionResponse {
  jobId: string;
  status: string;
}
```

### Job Data
```typescript
interface JobData {
  objectName: string;
  originalFilename: string;
  filehash: string;
  playerId: number;
  submissionId: string;
}
```

## File Storage

### MinIO Integration
- **Bucket Configuration**: Uses dedicated bucket for replays
- **Object Naming**: Generates unique object names for files
- **File Organization**: Organizes files by submission ID
- **Access Control**: Proper access permissions for stored files
- **Lifecycle Management**: Automatic cleanup of old files

### File Validation
- **Format Validation**: Validates Rocket League replay format
- **File Integrity**: Checks file integrity and completeness
- **Size Validation**: Validates file size constraints
- **Duplicate Detection**: Detects duplicate submissions
- **Metadata Validation**: Validates replay metadata

## Progress Tracking

### Progress Updates
- **Submission Start**: "Submission started..." (0%)
- **File Upload**: "Uploading replay..." (20%)
- **Validation**: "Validating replay..." (40%)
- **Processing**: "Processing replay..." (60%)
- **Completion**: "Complete!" (100%)

### Status Management
- **Pending**: Submission received and queued
- **Processing**: Currently being processed
- **Completed**: Successfully processed
- **Failed**: Processing failed with error
- **Cancelled**: Processing was cancelled

### Progress Queue
- **Real-time Updates**: Sends progress messages to specified queue
- **Error Handling**: Sends error messages on failure
- **Completion**: Sends final result on successful completion
- **Status Tracking**: Tracks processing status throughout

## Error Handling

### Validation Errors
- **File Format**: Invalid replay file format
- **File Size**: File size exceeds limits
- **Metadata**: Missing or invalid metadata
- **Duplicate**: Duplicate submission detection
- **Corruption**: Corrupted or incomplete files

### Processing Errors
- **Network Errors**: Connection failures during processing
- **Storage Errors**: MinIO upload/download failures
- **Queue Errors**: BullMQ job processing errors
- **Validation Errors**: Replay validation failures
- **Timeout Errors**: Processing timeout errors

### Retry Strategy
- **Max Retries**: 3 attempts for failed jobs
- **Backoff Strategy**: Exponential backoff with 2-second delay
- **Error Recovery**: Automatic retry on recoverable errors
- **Dead Letter**: Failed jobs moved to dead letter queue

## Performance Considerations

### Queue Management
- **Job Concurrency**: Configurable job concurrency
- **Queue Priority**: Priority-based job processing
- **Resource Management**: Efficient resource utilization
- **Memory Management**: Proper memory cleanup after processing
- **Connection Pooling**: Reuses connections where possible

### File Handling
- **Stream Processing**: Uses streams for large file processing
- **Chunked Upload**: Chunked uploads for large files
- **Temporary Files**: Proper cleanup of temporary files
- **Buffer Management**: Efficient buffer management
- **Compression**: Optional compression for file storage

## Security Features

### File Security
- **File Validation**: Validates file content and format
- **Access Control**: Proper access controls for file operations
- **Secure Storage**: Secure file storage in MinIO
- **Audit Trail**: Complete audit trail for file operations
- **Virus Scanning**: Optional virus scanning for uploaded files

### Data Protection
- **Input Validation**: Validates all input data
- **Data Sanitization**: Sanitizes data before processing
- **Access Control**: Proper access controls for data access
- **Encryption**: Supports encryption for sensitive data
- **Privacy**: Handles user data according to privacy regulations

## Integration Points

### External Services
- **MinIO**: File storage and retrieval
- **RabbitMQ**: Progress updates and notifications
- **Redis**: BullMQ job queue backend
- **Replay Parse Service**: Replay parsing integration

### Internal Dependencies
- **NestJS**: Framework for service development
- **BullMQ**: Job queue management
- **MinIO Client**: MinIO client library
- **Validation Libraries**: Runtime validation libraries

## Monitoring and Observability

### Logging
- **Structured Logging**: Structured logs for easy parsing
- **Log Levels**: Configurable log levels (error, warn, info, debug)
- **Context Logging**: Includes context information in logs
- **Log Aggregation**: Compatible with log aggregation systems

### Metrics
- **Processing Metrics**: Tracks submission processing performance
- **Error Metrics**: Tracks error rates and types
- **Throughput Metrics**: Tracks submission throughput
- **Latency Metrics**: Tracks processing latency

### Health Monitoring
- **Service Health**: Monitors service health and availability
- **Queue Health**: Monitors BullMQ queue health
- **Storage Health**: Monitors MinIO storage health
- **Alerting**: Can be configured for alerting on issues

## Deployment Considerations

### Scaling
- **Horizontal Scaling**: Multiple service instances
- **Queue Workers**: Multiple BullMQ workers for parallel processing
- **Load Balancing**: Load balancing across service instances
- **Resource Allocation**: Proper resource allocation for performance
- **Auto-scaling**: Can be configured for auto-scaling

### High Availability
- **Redundancy**: Multiple service instances for redundancy
- **Failover**: Automatic failover capabilities
- **Data Replication**: MinIO supports data replication
- **Backup Strategy**: Proper backup strategy for data protection
- **Disaster Recovery**: Disaster recovery capabilities

This service is essential for managing the complete replay submission workflow, ensuring reliable file uploads, comprehensive validation, and robust processing with real-time progress tracking and comprehensive error handling.