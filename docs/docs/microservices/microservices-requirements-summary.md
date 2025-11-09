# V1 Microservices Requirements Summary

## Overview
This document provides a comprehensive summary of the requirements for all V1 microservices in the Sprocket platform. These requirements serve as the foundation for migrating to a unified monolith architecture while preserving existing functionality and ensuring backward compatibility.

## Microservices Architecture

### Service Communication Pattern
All microservices follow a consistent communication pattern:
- **Transport**: RabbitMQ for message-based communication
- **Queue Structure**: Each service has a dedicated queue
- **Message Format**: JSON with pattern-based routing
- **Error Handling**: Consistent error handling across services
- **Progress Tracking**: Real-time progress updates via RabbitMQ

### Common Infrastructure
- **Redis**: Used for caching, job queues, and state management
- **MinIO**: Object storage for files and processed data
- **RabbitMQ**: Message broker for inter-service communication
- **Database**: Service-specific databases (InfluxDB, PostgreSQL)

## Service Requirements Summary

### 1. Image Generation Service
**Purpose**: SVG template processing and image generation

**Core Requirements**:
- Process SVG templates with dynamic data substitution
- Support for multiple image formats (PNG, JPEG, WebP)
- Font management and text rendering
- Color scheme application
- Multi-format output generation
- Caching for performance optimization

**Key Dependencies**:
- Sharp for image processing
- Canvas for SVG rendering
- Custom fonts configuration
- Template storage system

**Integration Points**:
- RabbitMQ for request/response
- Redis for caching
- MinIO for result storage

---

### 2. Matchmaking Service
**Purpose**: Competitive matchmaking and scrim management

**Core Requirements**:
- Player matchmaking with skill-based matching
- Scrim creation and management
- Queue management with timeouts
- Player status tracking
- Matchmaking algorithm implementation
- Timeout handling for pending/popped scrims

**Key Dependencies**:
- BullMQ for job processing
- Redis for state management
- RabbitMQ for communication
- Custom matchmaking algorithms

**Integration Points**:
- RabbitMQ for inter-service communication
- Redis for caching and state
- BullMQ for background job processing

---

### 3. Notification Service
**Purpose**: Multi-channel notification delivery

**Core Requirements**:
- Discord webhook notifications
- Generic webhook support
- Internal notification system
- Template-based message formatting
- Multi-channel delivery
- Retry logic for failed notifications

**Key Dependencies**:
- Axios for HTTP requests
- Discord.js for Discord integration
- BullMQ for job processing
- Template engine for message formatting

**Integration Points**:
- RabbitMQ for incoming notifications
- Redis for job queue
- External webhook endpoints
- Discord API

---

### 4. Replay Parse Service
**Purpose**: Rocket League replay file processing and analysis

**Core Requirements**:
- Replay file validation and processing
- Ballchasing API integration
- Progress tracking for long-running operations
- Result caching to avoid reprocessing
- Comprehensive error handling with retries
- Analytics collection for performance monitoring

**Key Dependencies**:
- Celery for task processing
- Python-ballchasing for API integration
- MinIO for file storage
- Redis for caching and task queue

**Integration Points**:
- RabbitMQ for progress updates and analytics
- MinIO for replay storage
- Ballchasing API for parsing
- Redis for Celery backend

---

### 5. Server Analytics Service
**Purpose**: Analytics data collection and storage

**Core Requirements**:
- Time-series data collection
- InfluxDB integration for metrics storage
- Multi-dimensional metrics support (tags, booleans, integers, floats)
- Real-time data processing
- Data validation and error handling
- High-throughput data ingestion

**Key Dependencies**:
- InfluxDB client for database operations
- Zod for data validation
- RabbitMQ for data ingestion
- NestJS framework

**Integration Points**:
- RabbitMQ for analytics data ingestion
- InfluxDB for time-series storage
- Other services for data generation

---

### 6. Submission Service
**Purpose**: Replay submission workflow management

**Core Requirements**:
- Replay file upload and validation
- Complete submission workflow orchestration
- Progress tracking with real-time updates
- File storage management in MinIO
- Comprehensive error handling and retry logic
- Integration with replay parsing pipeline

**Key Dependencies**:
- BullMQ for job processing
- MinIO for file storage
- RabbitMQ for communication
- Redis for job queue backend

**Integration Points**:
- RabbitMQ for submission requests and progress updates
- MinIO for replay file storage
- Replay Parse Service for processing
- Redis for job queue management

## Cross-Service Integration Patterns

### 1. Progress Tracking Pattern
All services implement consistent progress tracking:
```
Progress Message Format:
{
  "pattern": "progress",
  "data": {
    "key": "unique_id",
    "status": "status_message",
    "percentage": 0-100
  }
}
```

### 2. Error Handling Pattern
Consistent error handling across services:
- Structured error messages
- Retry logic with exponential backoff
- Dead letter queues for failed messages
- Comprehensive logging and monitoring

### 3. Analytics Collection Pattern
Standardized analytics data format:
```
Analytics Format:
{
  "pattern": "analytics",
  "data": {
    "name": "metric_name",
    "tags": [["tag1", "value1"]],
    "booleans": [["field", true]],
    "ints": [["field", 123]],
    "floats": [["field", 123.45]]
  }
}
```

## Migration Requirements

### 1. Preserve API Contracts
- Maintain existing message formats and patterns
- Ensure backward compatibility
- Preserve queue names and routing keys
- Maintain error response formats

### 2. Preserve Data Models
- Maintain existing data schemas
- Preserve validation rules
- Maintain database schemas where applicable
- Ensure data migration compatibility

### 3. Preserve Integration Points
- Maintain RabbitMQ queue structure
- Preserve Redis key patterns
- Maintain MinIO bucket structure
- Preserve external API integrations

### 4. Performance Requirements
- Maintain current throughput levels
- Preserve response time requirements
- Maintain scalability characteristics
- Ensure resource utilization efficiency

### 5. Operational Requirements
- Maintain monitoring and alerting capabilities
- Preserve logging formats and levels
- Maintain health check endpoints
- Preserve configuration management

## Technical Debt and Improvement Opportunities

### 1. Service Boundaries
- Some services have overlapping responsibilities
- Potential for consolidation and optimization
- Opportunity for better separation of concerns

### 2. Data Consistency
- Multiple services managing similar data
- Opportunity for centralized data management
- Potential for improved data consistency

### 3. Error Handling
- Inconsistent error handling patterns
- Opportunity for standardized error handling
- Potential for better error recovery

### 4. Configuration Management
- Configuration spread across multiple services
- Opportunity for centralized configuration
- Potential for better environment management

## Migration Strategy Recommendations

### 1. Phased Migration
- Migrate services one at a time
- Maintain backward compatibility during transition
- Implement feature flags for gradual rollout
- Monitor performance and stability

### 2. Data Migration
- Plan for data migration from service-specific storage
- Maintain data consistency during migration
- Implement rollback procedures
- Test data migration thoroughly

### 3. Integration Testing
- Comprehensive integration testing
- End-to-end workflow validation
- Performance testing under load
- Error scenario validation

### 4. Monitoring and Observability
- Maintain existing monitoring during migration
- Implement new monitoring for unified architecture
- Ensure comprehensive logging
- Set up alerting for critical issues

This requirements summary provides the foundation for planning and executing the migration from V1 microservices to a unified monolith architecture while preserving existing functionality and ensuring a smooth transition.