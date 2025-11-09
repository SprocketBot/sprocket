# Server Analytics Service

## Overview
The Server Analytics Service is a NestJS-based microservice that collects, processes, and stores analytics data from various sources within the Sprocket platform. It provides real-time metrics collection, time-series data storage in InfluxDB, and comprehensive analytics for monitoring platform performance, user behavior, and system health.

## Architecture
- **Language**: TypeScript with NestJS framework
- **Database**: InfluxDB for time-series analytics data
- **Communication**: RabbitMQ for message-based data ingestion
- **Transport**: RabbitMQ transport for microservice communication
- **Validation**: Zod for runtime data validation

## Core Functionality

### Analytics Data Collection
The service provides a comprehensive analytics collection system that handles:

- **Time-series Metrics**: Stores metrics with timestamps for historical analysis
- **Multi-dimensional Data**: Supports tags, booleans, integers, and floats
- **Real-time Processing**: Processes analytics data as it arrives via RabbitMQ
- **Data Validation**: Validates incoming analytics data using Zod schemas
- **Error Handling**: Comprehensive error handling and logging

### Key Components

#### Analytics Controller
- **Message Handler**: Processes analytics messages from RabbitMQ
- **Data Validation**: Validates incoming analytics data
- **InfluxDB Integration**: Writes data to InfluxDB with proper formatting
- **Error Handling**: Handles validation and database errors
- **Logging**: Comprehensive logging for debugging and monitoring

#### Analytics Service
- **Database Operations**: Manages InfluxDB write operations
- **Point Construction**: Builds InfluxDB points from analytics data
- **Batch Processing**: Supports batch writes for performance
- **Error Recovery**: Handles database connection issues
- **Metrics**: Tracks analytics processing performance

## Data Flow

### Message Processing Pipeline
1. **Message Receipt**: Receives analytics message via RabbitMQ
2. **Validation**: Validates message format using Zod schema
3. **Point Construction**: Converts analytics data to InfluxDB points
4. **Database Write**: Writes points to InfluxDB with timestamp
5. **Confirmation**: Logs successful processing
6. **Error Handling**: Handles and logs any processing errors

### Analytics Data Format
```json
{
  "pattern": "analytics",
  "data": {
    "name": "metric_name",
    "tags": [["tag1", "value1"], ["tag2", "value2"]],
    "booleans": [["bool_field", true]],
    "ints": [["int_field", 123]],
    "floats": [["float_field", 123.45]],
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

## Configuration

### Service Configuration
```json
{
  "transport": {
    "url": "amqp://rabbitmq:5672",
    "queue": "analytics"
  },
  "influx": {
    "url": "http://influxdb:8086",
    "token": "your-influxdb-token",
    "org": "sprocket",
    "bucket": "analytics",
    "flushInterval": 1000
  }
}
```

### Environment Variables
- `INFLUX_URL`: InfluxDB server URL
- `INFLUX_TOKEN`: InfluxDB authentication token
- `INFLUX_ORG`: InfluxDB organization name
- `INFLUX_BUCKET`: InfluxDB bucket for analytics data

## Data Models

### Analytics Data Schema
```typescript
interface AnalyticsData {
  name: string;
  tags?: Array<[string, string]>;
  booleans?: Array<[string, boolean]>;
  ints?: Array<[string, number]>;
  floats?: Array<[string, number]>;
  timestamp?: string;
}
```

### Message Schema
```typescript
interface AnalyticsMessage {
  pattern: string;
  data: AnalyticsData;
}
```

## InfluxDB Integration

### Point Construction
- **Measurement**: Uses `name` field as measurement name
- **Tags**: Converts tags array to InfluxDB tags
- **Fields**: Handles boolean, integer, and float fields
- **Timestamp**: Uses provided timestamp or current time
- **Batch Writing**: Supports batch writes for performance

### Database Operations
- **Write API**: Uses InfluxDB write API for data insertion
- **Error Handling**: Handles write failures and connection issues
- **Retry Logic**: Implements retry logic for failed writes
- **Performance**: Optimized for high-throughput data ingestion

## Analytics Types

### Supported Metrics
- **Counter Metrics**: Integer and float counters
- **Boolean Metrics**: True/false state tracking
- **Tagged Metrics**: Multi-dimensional metrics with tags
- **Time-series Data**: Historical data with timestamps

### Example Metrics
```json
{
  "name": "parseReplay",
  "tags": [["taskId", "123"], ["parser", "ballchasing"]],
  "booleans": [["success", true], ["cached", false]],
  "ints": [["getMs", 123], ["parseMs", 456], ["totalMs", 579]]
}
```

## Error Handling

### Validation Errors
- **Schema Validation**: Validates incoming message format
- **Data Type Validation**: Validates field types and values
- **Required Fields**: Ensures required fields are present
- **Error Logging**: Logs validation errors for debugging

### Database Errors
- **Connection Errors**: Handles InfluxDB connection failures
- **Write Errors**: Handles write operation failures
- **Retry Logic**: Implements retry logic for failed operations
- **Fallback Strategy**: Provides fallback strategies for critical errors

### Message Processing Errors
- **Malformed Messages**: Handles invalid message formats
- **Missing Data**: Handles missing required fields
- **Type Mismatches**: Handles type conversion errors
- **Logging**: Comprehensive error logging and monitoring

## Performance Considerations

### Throughput Optimization
- **Batch Processing**: Supports batch writes for high throughput
- **Connection Pooling**: Reuses database connections
- **Async Processing**: Asynchronous message processing
- **Memory Management**: Efficient memory usage for large datasets

### Scalability
- **Horizontal Scaling**: Multiple service instances can process messages
- **Load Balancing**: RabbitMQ provides load balancing
- **Resource Monitoring**: Monitors resource usage and performance
- **Auto-scaling**: Can be configured for auto-scaling based on load

## Monitoring and Observability

### Logging
- **Structured Logging**: Structured logs for easy parsing
- **Log Levels**: Configurable log levels (error, warn, info, debug)
- **Context Logging**: Includes context information in logs
- **Log Aggregation**: Compatible with log aggregation systems

### Metrics
- **Processing Metrics**: Tracks message processing performance
- **Error Metrics**: Tracks error rates and types
- **Throughput Metrics**: Tracks message throughput
- **Latency Metrics**: Tracks processing latency

### Health Monitoring
- **Service Health**: Monitors service health and availability
- **Database Health**: Monitors InfluxDB connection health
- **Queue Health**: Monitors RabbitMQ queue health
- **Alerting**: Can be configured for alerting on issues

## Security Features

### Data Security
- **Input Validation**: Validates all incoming data
- **Data Sanitization**: Sanitizes data before storage
- **Access Control**: Proper access controls for data access
- **Audit Trail**: Maintains audit trail for data changes

### Network Security
- **Secure Connections**: Uses secure connections to InfluxDB
- **Authentication**: Proper authentication for InfluxDB
- **Authorization**: Proper authorization for data access
- **Encryption**: Supports encryption for sensitive data

## Integration Points

### External Services
- **InfluxDB**: Primary analytics database
- **RabbitMQ**: Message queue for data ingestion
- **Monitoring Systems**: Integrates with monitoring systems

### Internal Dependencies
- **NestJS**: Framework for service development
- **Zod**: Runtime validation library
- **InfluxDB Client**: InfluxDB client library

## Deployment Considerations

### Scaling
- **Horizontal Scaling**: Multiple service instances
- **Load Balancing**: RabbitMQ provides load balancing
- **Resource Allocation**: Proper resource allocation for performance
- **Auto-scaling**: Can be configured for auto-scaling

### High Availability
- **Redundancy**: Multiple service instances for redundancy
- **Failover**: Automatic failover capabilities
- **Data Replication**: InfluxDB supports data replication
- **Backup Strategy**: Proper backup strategy for data protection

This service is essential for collecting and storing analytics data across the Sprocket platform, enabling comprehensive monitoring, performance analysis, and business intelligence capabilities.