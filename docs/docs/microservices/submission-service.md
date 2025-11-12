# Submission Service - Core Functional Requirements

## Purpose
Manage the complete replay submission workflow, including file upload, validation, processing orchestration, and status tracking for Rocket League replay files.

## Core Functional Requirements

### 1. File Upload Management
- **Input**: Replay file binary data, filename, player information
- **Processing**: Validate file format and store securely
- **Output**: Upload confirmation with file reference
- **Validation**: Verify file is valid Rocket League replay format

### 2. Submission Validation
- **Input**: Uploaded replay file and metadata
- **Processing**: Comprehensive validation of replay content
- **Output**: Validation result with detailed error information
- **Checks**: File integrity, format compliance, duplicate detection

### 3. Processing Orchestration
- **Input**: Validated replay submission
- **Processing**: Coordinate replay parsing and analysis workflow
- **Output**: Processing job reference and status
- **Workflow**: Manage submission → validation → parsing → completion pipeline

### 4. Status Tracking
- **Input**: Processing job identifier
- **Processing**: Track submission through processing pipeline
- **Output**: Real-time status updates and progress information
- **Visibility**: Provide transparency into processing stages

## Data Requirements

### Submission Request Structure
```typescript
interface SubmissionRequest {
  file: Buffer;
  filename: string;
  filehash: string;
  playerId: string;
  submissionId: string;
  metadata?: {
    gameMode?: string;
    map?: string;
    date?: Date;
  };
}
```

### Submission Response Structure
```typescript
interface SubmissionResponse {
  submissionId: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  result?: {
    matchId?: string;
    parsedData?: any;
    error?: string;
  };
}
```

### Processing Status Structure
```typescript
interface ProcessingStatus {
  submissionId: string;
  stage: 'upload' | 'validation' | 'parsing' | 'completion';
  progress: number;
  startedAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  error?: string;
}
```

## Business Logic Requirements

### File Validation Logic
- **Format Validation**: Verify file is valid Rocket League replay format
- **Integrity Check**: Verify file completeness and corruption status
- **Size Validation**: Enforce reasonable file size limits
- **Duplicate Detection**: Check if replay has already been submitted

### Submission Workflow
1. **File Upload**: Receive and store replay file
2. **Initial Validation**: Basic file format and integrity checks
3. **Duplicate Check**: Verify replay hasn't been processed before
4. **Processing Queue**: Add to processing queue for detailed analysis
5. **Status Updates**: Provide progress updates throughout process
6. **Completion**: Store results and notify completion

### Status Management
- **Stage Tracking**: Track current processing stage
- **Progress Calculation**: Calculate and report completion percentage
- **Time Estimation**: Estimate remaining processing time
- **Error Reporting**: Report errors with detailed information

## Integration Points

### Database Integration
- **Submission Storage**: Store submission metadata and status
- **File Storage**: Store replay file content and references
- **Status Tracking**: Track processing status and history
- **Result Storage**: Store processing results and parsed data

### Processing Integration
- **Replay Parsing**: Integrate with replay parsing service
- **Validation Services**: Use validation services for file checking
- **Queue Management**: Manage processing queue and priorities
- **Result Processing**: Process and store parsing results

## Error Handling Requirements

### Validation Errors
- **Invalid Format**: Handle non-replay files or corrupted replays
- **File Size**: Handle files exceeding size limits
- **Duplicate Submission**: Handle attempts to submit already-processed replays
- **Missing Data**: Handle submissions with incomplete metadata

### Processing Errors
- **Upload Failures**: Handle file upload failures
- **Validation Failures**: Handle validation check failures
- **Processing Failures**: Handle replay parsing failures
- **Storage Failures**: Handle database or file storage failures

### Recovery Strategies
- **Retry Logic**: Implement retry for transient failures
- **Error Reporting**: Provide detailed error information to users
- **Graceful Degradation**: Continue operation when individual submissions fail
- **Manual Recovery**: Support manual retry of failed submissions

## Performance Requirements

### Response Times
- **File Upload**: < 5s for file upload and initial validation
- **Submission Processing**: < 1s to create processing job
- **Status Queries**: < 100ms for status check requests
- **Completion Notification**: < 1s to notify completion

### Throughput
- **Concurrent Submissions**: Handle multiple simultaneous submissions
- **Queue Processing**: Process submissions at sustainable rate
- **File Size Handling**: Efficiently handle large replay files
- **Resource Management**: Efficient memory and storage usage

## Security Requirements

### File Security
- **File Validation**: Validate file content before processing
- **Size Limits**: Enforce reasonable file size limits
- **Type Restrictions**: Only accept valid replay file types
- **Virus Scanning**: Optional scanning for malicious content

### Data Protection
- **User Authentication**: Verify user identity for submissions
- **Access Control**: Control who can submit and view replays
- **Privacy Protection**: Handle player data according to privacy policies
- **Audit Logging**: Log submission attempts for security audit

## Testing Requirements

### Unit Tests
- **File Validation**: Test replay file validation logic
- **Status Management**: Test status tracking and updates
- **Error Handling**: Test error scenarios and recovery
- **Workflow Logic**: Test submission workflow logic

### Integration Tests
- **File Upload**: Test file upload and storage integration
- **Database Integration**: Test database storage and retrieval
- **Processing Integration**: Test integration with parsing services
- **End-to-End Tests**: Test complete submission workflows

## Migration Considerations

### Database Schema
- **Submissions Table**: Store submission metadata and status
- **Replay Files Table**: Store replay file content and references
- **Processing Status Table**: Track processing status and history
- **Submission Results Table**: Store processing results and errors

### Code Organization
- **Service Layer**: Business logic for submission management
- **Repository Layer**: Database access for submissions and files
- **Controller Layer**: API endpoints for submission operations
- **Workflow Layer**: Orchestrate submission processing workflow

### Configuration
- **File Limits**: Configure file size and format restrictions
- **Processing Settings**: Configure validation and processing rules
- **Storage Settings**: Configure file storage and retention
- **Queue Settings**: Configure processing queue behavior

This focused documentation captures the essential submission management functionality that needs to be integrated into the monolithic backend, emphasizing file handling, workflow orchestration, and status tracking without microservice-specific implementation details.