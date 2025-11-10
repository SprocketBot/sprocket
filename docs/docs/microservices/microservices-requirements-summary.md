# V1 Microservices Core Functional Requirements for Monolith Integration

## Overview
This document provides the core functional requirements for integrating V1 microservices into the unified monolithic backend. The focus is on preserving essential business functionality while eliminating distributed architecture complexity. All services will be integrated into the existing PostgreSQL-based monolith.

## Integration Strategy

### Core Principle
**Simplify by integrating directly into the monolithic backend, removing distributed complexity while preserving business functionality.**

### Key Changes
- **Eliminate Message Queues**: Replace RabbitMQ with direct function calls
- **Consolidate Storage**: Use PostgreSQL for all data storage needs
- **Simplify Architecture**: Remove microservice transport layers
- **Direct Integration**: Implement functionality as services within the monolith

## Service Integration Requirements

### 1. Image Generation Service Integration
**Core Functionality to Preserve:**
- SVG template processing with variable substitution
- Image rendering to multiple formats (PNG, JPEG, WebP)
- Color scheme application and customization
- Multi-resolution output generation

**Integration Approach:**
- Implement as internal service within monolith
- Store templates in PostgreSQL database
- Use direct function calls instead of message queues
- Integrate with existing file storage system

**Database Requirements:**
- Templates table for SVG template storage
- Generated images table for result storage
- Template metadata and usage tracking

---

### 2. Matchmaking Service Integration
**Core Functionality to Preserve:**
- Player skill-based matchmaking algorithms
- Scrim creation and lifecycle management
- Queue management with timeout handling
- Player status tracking and updates

**Integration Approach:**
- Implement matchmaking logic as service layer
- Use PostgreSQL for player queues and scrim state
- Replace Redis state management with database transactions
- Implement timeout handling with database queries

**Database Requirements:**
- Players table with skill ratings and status
- Scrims table for match organization
- Queue entries table for matchmaking queues
- Match history for completed games

---

### 3. Notification Service Integration
**Core Functionality to Preserve:**
- Multi-channel notification delivery (Discord, webhooks, internal)
- Template-based message formatting
- Retry logic for failed deliveries
- User notification preferences

**Integration Approach:**
- Implement as notification service within monolith
- Store templates and preferences in PostgreSQL
- Use HTTP client for external webhook calls
- Implement internal notifications as database operations

**Database Requirements:**
- Notification templates table
- User preferences table
- Notification history table
- Failed notifications table for retry logic

---

### 4. Replay Parse Service Integration
**Core Functionality to Preserve:**
- Rocket League replay file validation
- External API integration with Ballchasing
- Match statistics extraction and transformation
- Progress tracking for long-running operations

**Integration Approach:**
- Implement as replay processing service
- Store replay files in PostgreSQL (or file system with DB references)
- Integrate external API calls directly
- Use database for progress tracking

**Database Requirements:**
- Replay files table for metadata and storage
- Parsed matches table for statistics
- Processing status table for progress tracking
- Player statistics table for individual performance data

---

### 5. Server Analytics Service Integration
**Core Functionality to Preserve:**
- Time-series metrics collection and storage
- Multi-dimensional metrics with tags
- Real-time data processing
- Performance monitoring and business metrics

**Integration Approach:**
- Implement analytics collection within monolith
- Use PostgreSQL with time-series optimizations
- Store metrics directly in database tables
- Implement aggregation queries for analysis

**Database Requirements:**
- Metrics table for time-series data
- Tags table for metric dimensions
- Aggregations table for pre-computed statistics
- Metadata table for metric schemas

---

### 6. Submission Service Integration
**Core Functionality to Preserve:**
- Replay file upload and validation
- Submission workflow orchestration
- Status tracking and progress updates
- Integration with replay parsing pipeline

**Integration Approach:**
- Implement as submission management service
- Handle file uploads through monolith API
- Use database transactions for workflow state
- Integrate directly with replay parsing service

**Database Requirements:**
- Submissions table for submission metadata
- File storage table for replay files
- Processing status table for workflow state
- Submission results table for completed processing

## Common Integration Patterns

### 1. Direct Service Calls
Replace message queues with direct function calls:
```typescript
// Before (microservice)
await this.rmqService.send('image-generation', request);

// After (monolith)
const result = await this.imageGenerationService.generate(request);
```

### 2. Database-Centric State Management
Replace Redis/distributed state with PostgreSQL:
```typescript
// Before (microservice)
await this.redisService.set(`queue:${playerId}`, data);

// After (monolith)
await this.queueRepository.create({ playerId, data });
```

### 3. Simplified Configuration
Consolidate distributed configuration:
```typescript
// Before (microservice)
// Multiple service configs, queue configs, transport configs

// After (monolith)
// Single configuration object
const config = {
  services: {
    imageGeneration: { /* settings */ },
    matchmaking: { /* settings */ },
    // etc.
  }
};
```

## Data Migration Strategy

### Phase 1: Service Integration
1. Implement services within monolith structure
2. Create necessary database tables
3. Develop integration tests
4. Maintain backward compatibility

### Phase 2: Data Migration
1. Migrate existing data from microservice databases
2. Transfer file storage from MinIO to monolith storage
3. Update application code to use monolith services
4. Validate data integrity

### Phase 3: Infrastructure Cleanup
1. Remove microservice deployments
2. Decommission RabbitMQ and Redis
3. Clean up MinIO storage
4. Update monitoring and alerting

## Performance Considerations

### Database Optimization
- **Indexing**: Create appropriate indexes for common queries
- **Partitioning**: Partition large tables (metrics, notifications)
- **Connection Pooling**: Optimize database connection usage
- **Query Optimization**: Optimize complex queries and joins

### Caching Strategy
- **Application-Level Caching**: Cache frequently accessed data
- **Template Caching**: Cache compiled templates
- **Result Caching**: Cache expensive computation results
- **Session Caching**: Cache user session data

### Resource Management
- **Memory Usage**: Monitor and optimize memory consumption
- **CPU Usage**: Balance CPU usage across services
- **Storage Efficiency**: Optimize storage usage and retention
- **Concurrent Processing**: Handle concurrent requests efficiently

## Monitoring and Observability

### Application Monitoring
- **Service Health**: Monitor individual service health
- **Database Performance**: Monitor database query performance
- **Error Rates**: Track error rates by service
- **Response Times**: Monitor API response times

### Business Metrics
- **User Activity**: Track user engagement metrics
- **System Usage**: Monitor system resource utilization
- **Service Performance**: Track service-specific metrics
- **Business KPIs**: Monitor key business indicators

## Testing Strategy

### Integration Testing
- **Service Integration**: Test service interactions within monolith
- **Database Integration**: Test database operations and transactions
- **API Compatibility**: Ensure API compatibility with existing clients
- **Performance Testing**: Test performance under expected load

### Migration Testing
- **Data Migration**: Test data migration procedures
- **Rollback Procedures**: Test rollback capabilities
- **Cutover Testing**: Test production cutover procedures
- **Monitoring Validation**: Validate monitoring and alerting

This revised documentation focuses on the core business functionality that needs to be preserved during monolith integration, providing clear guidance for implementation while removing distributed architecture complexity.