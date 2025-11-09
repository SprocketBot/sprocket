# Notification Service

## Overview
The Notification Service is a NestJS-based microservice that manages the delivery of notifications across the Sprocket platform. It handles various types of notifications including Discord guild messages, direct messages, webhook messages, and internal notifications with Redis-based persistence.

## Architecture
- **Framework**: NestJS with TypeScript
- **Transport**: RabbitMQ (RMQ)
- **Storage**: Redis for notification persistence
- **Communication**: gRPC-style message patterns
- **Bot Integration**: Integration with Discord bot service

## Core Functionality

### Notification Management
The service provides a unified interface for sending different types of notifications:

- **Guild Text Messages**: Send messages to Discord guild channels
- **Direct Messages**: Send private messages to users
- **Webhook Messages**: Send notifications via webhooks
- **Internal Notifications**: Store notifications in Redis for later retrieval

### Key Components

#### NotificationController
- **Endpoint**: `NotificationEndpoint.SendNotification`
- **Input Validation**: Uses Zod schemas for request validation
- **Response Handling**: Returns success status for notification delivery
- **Error Management**: Comprehensive error handling and logging

#### NotificationService
- **Notification Routing**: Routes notifications to appropriate channels based on type
- **Redis Integration**: Stores internal notifications with TTL (Time To Live)
- **Bot Service Integration**: Interfaces with Discord bot for external notifications
- **UUID Generation**: Generates unique notification IDs for tracking

## Notification Types

### External Notifications
- **GuildTextMessage**: Messages sent to Discord guild channels
- **DirectMessage**: Private messages sent to Discord users
- **WebhookMessage**: HTTP webhook notifications

### Internal Notifications
- **Redis Storage**: Notifications stored with 14-day TTL
- **User-specific**: Organized by user ID and notification type
- **Retrieval**: Can be fetched by users later through Redis queries

## Data Models

### Notification Input
```typescript
interface NotificationInput {
  id?: string;
  type: NotificationMessageType;
  userId: number;
  expiration?: Date;
  payload?: Record<string, any>;
  notification: {
    type: NotificationMessageType;
    // Additional notification-specific data
  };
}
```

### Notification Types
```typescript
enum NotificationMessageType {
  GuildTextMessage = "GuildTextMessage",
  DirectMessage = "DirectMessage",
  WebhookMessage = "WebhookMessage"
}
```

## API Endpoints

### Send Notification
- **Pattern**: `NotificationEndpoint.SendNotification`
- **Input**: `NotificationInput<NotificationEndpoint.SendNotification>`
- **Output**: `NotificationOutput<NotificationEndpoint.SendNotification>`
- **Description**: Processes and sends notifications through appropriate channels

## Configuration

### Transport Configuration
- **RabbitMQ URL**: Connection string for message broker
- **Notification Queue**: Queue name for notification processing
- **Queue Options**: Durable queue with heartbeat configuration
- **Authentication**: Optional RabbitMQ credentials

### Redis Configuration
- **Host**: Redis server hostname
- **Port**: Redis server port
- **Prefix**: Key prefix for notification storage
- **Secure**: SSL/TLS configuration

## Data Flow

1. **Request Reception**: Receives notification request via RabbitMQ
2. **Validation**: Validates input data using Zod schemas
3. **Internal Storage**: Stores notification in Redis with TTL if payload exists
4. **Routing**: Determines notification type and routes to appropriate handler
5. **External Delivery**: Sends notification through bot service for external channels
6. **Response**: Returns success status

## Key Features

### Multi-channel Support
- Discord guild messages
- Direct Discord messages
- Webhook notifications
- Internal notification storage

### Redis Integration
- **TTL Support**: Automatic expiration of notifications
- **User Organization**: Notifications grouped by user ID
- **Type-based Storage**: Different notification types handled separately
- **Scalable Storage**: Redis-based solution for high performance

### Error Handling
- **Validation Errors**: Comprehensive input validation
- **Bot Service Failures**: Graceful handling of external service failures
- **Redis Errors**: Proper error handling for storage operations
- **Logging**: Detailed error logging for debugging

## Performance Considerations
- **Asynchronous Processing**: Non-blocking notification delivery
- **Redis Caching**: Fast storage and retrieval of notifications
- **Connection Pooling**: Efficient Redis connection management
- **Message Queuing**: RabbitMQ for reliable message delivery

## Security Features
- **Input Validation**: Prevents injection attacks through validation
- **Authentication**: RabbitMQ credential support
- **Data Sanitization**: Safe handling of notification payloads
- **Access Control**: User-specific notification access

## Integration Points
- **Redis**: For internal notification storage
- **RabbitMQ**: For message-based communication
- **Bot Service**: For Discord integration
- **Common Library**: Shared types from `@sprocketbot/common`

## Deployment
- **Container**: Docker-based deployment
- **Scalability**: Horizontal scaling through Redis clustering
- **Monitoring**: Health checks and metrics collection
- **Queue Workers**: Multiple workers for notification processing

## Testing
- **Unit Tests**: Individual service testing
- **Integration Tests**: Redis and RabbitMQ integration testing
- **Bot Service Mocking**: Testing without external dependencies
- **Load Testing**: Performance under high notification volume

This service is essential for maintaining user engagement and communication across the Sprocket platform, providing reliable notification delivery through multiple channels while ensuring proper storage and retrieval of internal notifications.