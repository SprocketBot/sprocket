# V1 Microservices Core Functional Requirements - Monolith Integration Index

## Overview
This directory contains core functional requirements for integrating V1 microservices into the unified monolithic backend. The documentation focuses on essential business functionality that needs to be preserved, removing distributed architecture complexity that is unnecessary for the system's scale.

## Integration Philosophy

### Core Principle
**Simplify by integrating business functionality directly into the PostgreSQL-based monolithic backend, eliminating distributed complexity while preserving essential features.**

### Key Transformations
- **Message Queues → Direct Function Calls**: Replace RabbitMQ with service method calls
- **Distributed State → Database Transactions**: Replace Redis with PostgreSQL
- **Multiple Databases → Single PostgreSQL**: Consolidate all data storage
- **Microservice Transport → Internal APIs**: Remove transport layers

## Service Integration Documentation

### Individual Service Requirements
Each service has been analyzed for core functionality needed in the monolith:

- **[Image Generation Service](image-generation-service.md)** - SVG template processing and dynamic image generation
- **[Matchmaking Service](matchmaking-service.md)** - Player skill-based matchmaking and scrim management  
- **[Notification Service](notification-service.md)** - Multi-channel notification delivery (Discord, webhooks, internal)
- **[Replay Parse Service](replay-parse-service.md)** - Rocket League replay file processing and analysis
- **[Server Analytics Service](server-analytics-service.md)** - Time-series metrics collection and storage
- **[Submission Service](submission-service.md)** - Replay submission workflow management

### Integration Summary
- **[Microservices Requirements Summary](microservices-requirements-summary.md)** - Comprehensive integration strategy and database requirements

## Key Integration Patterns

### 1. Direct Service Integration
```typescript
// Before: Distributed microservice call
await this.rmqService.send('image-generation', request);

// After: Direct monolith service call
const result = await this.imageGenerationService.generate(request);
```

### 2. Database-Centric Architecture
```typescript
// Before: Redis + separate databases
await this.redisService.set(`queue:${playerId}`, data);
await this.influxService.writeMetric(metric);

// After: Single PostgreSQL database
await this.queueRepository.create({ playerId, data });
await this.metricsRepository.create(metric);
```

### 3. Simplified Configuration
- Single configuration object for all services
- Environment-based configuration management
- Database-stored configuration where appropriate
- Reduced operational complexity

## Business Functionality Preservation

### Essential Features Maintained
1. **Image Generation**: SVG template processing with data substitution
2. **Matchmaking**: Skill-based player matching with timeout handling
3. **Notifications**: Multi-channel delivery with template support
4. **Replay Processing**: File validation and external API integration
5. **Analytics**: Time-series data collection and storage
6. **Submission Management**: Complete workflow orchestration

### Technical Debt Eliminated
1. **Message Queue Complexity**: Removed RabbitMQ infrastructure
2. **Distributed State**: Consolidated Redis state into PostgreSQL
3. **Multiple Databases**: Unified storage in single PostgreSQL instance
4. **Service Discovery**: Simplified to internal dependency injection
5. **Network Latency**: Eliminated inter-service communication overhead

## Database Integration Strategy

### PostgreSQL Schema Design
Each service requires specific database tables:

- **Image Generation**: Templates table, generated images table
- **Matchmaking**: Players table, scrims table, queue entries table
- **Notifications**: Templates table, preferences table, history table
- **Replay Parsing**: Replay files table, parsed matches table, player stats table
- **Analytics**: Metrics table, tags table, aggregations table
- **Submissions**: Submissions table, processing status table, results table

### Data Migration Approach
1. **Schema Creation**: Create necessary tables in PostgreSQL
2. **Data Transfer**: Migrate existing data from service-specific databases
3. **File Storage**: Consolidate file storage (replays, images) with PostgreSQL references
4. **Validation**: Ensure data integrity during migration

## Performance Considerations

### Optimization Strategies
- **Database Indexing**: Create appropriate indexes for common queries
- **Connection Pooling**: Optimize database connection usage
- **Query Optimization**: Optimize complex joins and aggregations
- **Caching**: Implement application-level caching where beneficial

### Resource Management
- **Memory Usage**: Monitor and optimize memory consumption across services
- **CPU Utilization**: Balance processing load across integrated services
- **Storage Efficiency**: Optimize data storage and retention policies
- **Concurrent Processing**: Handle multiple simultaneous operations

## Testing and Validation

### Integration Testing
- **Service Integration**: Test service interactions within monolith
- **Database Operations**: Test PostgreSQL integration and performance
- **API Compatibility**: Ensure backward compatibility with existing clients
- **Performance Validation**: Validate performance meets requirements

### Migration Testing
- **Data Integrity**: Validate data migration accuracy
- **Functionality Preservation**: Ensure all features work correctly
- **Rollback Procedures**: Test rollback capabilities if needed
- **Production Validation**: Validate production deployment success

## Operational Benefits

### Simplified Operations
- **Single Deployment**: Deploy one application instead of multiple services
- **Unified Monitoring**: Monitor one application and database
- **Reduced Infrastructure**: Eliminate message queues, cache servers, and multiple databases
- **Lower Complexity**: Simplified troubleshooting and maintenance

### Cost Reduction
- **Infrastructure Costs**: Reduce server and service requirements
- **Operational Overhead**: Simplify deployment and maintenance
- **Development Efficiency**: Faster development with unified codebase
- **Debugging Simplicity**: Easier issue identification and resolution

## Migration Timeline

### Phase 1: Service Implementation (Weeks 1-4)
- Implement services within monolith structure
- Create PostgreSQL database schemas
- Develop integration tests
- Maintain API compatibility

### Phase 2: Data Migration (Weeks 5-6)
- Migrate existing data to PostgreSQL
- Transfer file storage and references
- Validate data integrity
- Test migration procedures

### Phase 3: Production Cutover (Week 7)
- Deploy monolith with integrated services
- Switch traffic from microservices to monolith
- Monitor performance and stability
- Decommission microservices infrastructure

This documentation provides the foundation for successfully integrating V1 microservice functionality into the unified monolithic backend while preserving essential business capabilities and eliminating unnecessary distributed complexity.