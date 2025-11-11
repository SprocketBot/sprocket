# Notification Service Migration - Technical Design

## Overview

This document outlines the technical design for migrating the notification service from a standalone microservice into the core monolith, following the architectural decisions established in our migration planning.

**Key Benefit**: Integration into the core monolith allows us to leverage TypeORM for type-safe database operations, eliminating the need for manual query building and providing compile-time type checking for all database interactions.

## Architecture Decision

### Decision: Integrate into Core Monolith

**Rationale:**
- **Simplified Infrastructure**: Eliminates separate service deployment, inter-service communication, and queue management
- **TypeORM Benefits**: Full type-safe database operations with entity decorators, automatic migrations, and repository pattern
- **Easier Development**: Single codebase, shared types, direct debugging, and unified testing
- **Sufficient Scale**: Current notification volume doesn't require independent scaling
- **Operational Efficiency**: Centralized logging, monitoring, and error handling

**Trade-offs:**
- **Reduced Isolation**: Discord API failures could impact core service (mitigated by proper error handling)
- **Shared Resources**: Notification processing shares CPU/memory with core (acceptable for current scale)
- **Deployment Coupling**: Notification changes require core deployment (acceptable given development velocity)

## Key Technical Decisions

### 1. Event Queue Mechanism

**Decision**: Direct Function Calls (No Queue Needed)

**Implementation:**
```typescript
// Core service directly calls notification service
@Injectable()
export class ScrimService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly coreService: CoreService
  ) {}

  async completeScrim(scrimId: string) {
    // Process scrim completion...
    
    // Direct notification call
    await this.notificationService.sendScrimCompleted(scrim);
  }
}
```

**Benefits:**
- Immediate execution without queue latency
- Simplified error handling and retry logic
- No persistence overhead
- Type-safe function calls

### 2. Template Engine

**Decision**: Handlebars.js

**Rationale:**
- Lightweight with minimal overhead
- Simple `{{variable}}` syntax matches existing patterns
- Logic-less templates prevent complexity creep
- Excellent TypeScript support
- Sufficient for Discord embed structures and variable substitution

**Implementation:**
```typescript
// Template stored in database
{
  name: "scrim_completed",
  channel: "discord",
  template: `
    {
      "embeds": [{
        "title": "Scrim Completed",
        "description": "Scrim {{scrimId}} has finished",
        "fields": [
          {"name": "Game Mode", "value": "{{gameMode}}"},
          {"name": "Players", "value": "{{playerCount}}"}
        ]
      }]
    }
  `
}

// Usage in service
const rendered = this.handlebars.compile(template)(data);
```

### 3. Database Schema with TypeORM

**Decision**: Store notification metadata only

**TypeORM Entities:**

```typescript
// notification-template.entity.ts
@Entity()
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['discord', 'webhook', 'internal'] })
  channel: NotificationChannel;

  @Column('text')
  content: string; // Handlebars template

  @Column({ type: 'jsonb', nullable: true })
  defaultData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// notification-history.entity.ts
@Entity()
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['discord', 'webhook', 'internal'] })
  channel: NotificationChannel;

  @Column()
  recipientId: string; // User ID, webhook URL, etc.

  @Column({ type: 'enum', enum: ['pending', 'sent', 'failed'] })
  status: NotificationStatus;

  @Column()
  templateName: string;

  @Column({ type: 'jsonb', nullable: true })
  templateData: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  sentAt: Date;
}

// user-notification-preference.entity.ts
@Entity()
export class UserNotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: ['discord', 'webhook', 'internal', 'email'] })
  channel: NotificationChannel;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**TypeORM Benefits:**
- Compile-time type checking for all database operations
- Automatic migration generation
- Repository pattern with type-safe queries
- Relationship management (ManyToOne, OneToMany, etc.)
- Decorator-based entity definition

### 4. Code Reuse Strategy

**High Reuse Potential:**
- ✅ Discord message formatting and embed structures
- ✅ Event handlers for scrim/match/submission notifications
- ✅ Branding options and organization-specific formatting
- ✅ Direct message and webhook sending patterns
- ✅ Player/organization data fetching logic

**Refactoring Required:**
- Remove RabbitMQ/Redis dependencies
- Convert `@SprocketEvent` decorators to direct method calls
- Update imports to use core services directly
- Adapt to new TypeORM database schema
- Replace event marshaling with direct service calls

### 5. Deployment Strategy

**Decision**: Part of core service deployment

**Implementation:**
- **Docker**: No changes to docker-compose.yaml
- **Build**: Included in core's existing build process
- **Database**: Migrations run with core's TypeORM migrations
- **Scaling**: Scales with core service (sufficient for current needs)

**Zero Infrastructure Changes Required:**
```yaml
# No new services added to docker-compose.yaml
# Notification logic runs within existing core service
```

### 6. Observability & Monitoring

**Decision**: Leverage existing core monitoring infrastructure

**Implementation:**
```typescript
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendNotification(template: string, data: any) {
    const startTime = Date.now();
    
    try {
      // Send notification...
      
      // Metrics
      this.metrics.increment('notifications.sent', { channel: 'discord' });
      this.metrics.timing('notifications.send_time', Date.now() - startTime);
      
    } catch (error) {
      this.logger.error('Notification failed', { template, error });
      this.metrics.increment('notifications.failed', { channel: 'discord' });
      throw error;
    }
  }
}
```

**Key Metrics:**
- `notifications.sent` (by channel, template)
- `notifications.failed` (by channel, error type)
- `notifications.send_time` (latency histogram)
- `template.render_time` (performance monitoring)

**Alerts:**
- High failure rate (>5% over 5 minutes)
- Notification delivery latency p99 > 2 seconds
- Template rendering errors

### 7. Error Handling & Retry

**Decision**: In-memory retry with exponential backoff

**Implementation:**
```typescript
async sendWithRetry(
  sendFn: () => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await sendFn();
      return;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        this.logger.warn(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  this.logger.error('Max retries exceeded', { error: lastError });
  throw lastError;
}
```

**Benefits:**
- No dead-letter queue needed (failures logged but not persisted)
- Exponential backoff prevents overwhelming failing services
- In-memory retry sufficient for monolith architecture

### 8. API Contract

**Decision**: Internal module interface (no HTTP API)

**Implementation:**
```typescript
// Core service imports and calls notification service directly
@Injectable()
export class ScrimService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly coreService: CoreService
  ) {}

  async handleScrimEvent(scrim: Scrim) {
    // Direct type-safe function call
    await this.notificationService.sendScrimNotification(scrim);
  }
}

// Notification service provides typed methods
@Injectable()
export class NotificationService {
  async sendScrimNotification(scrim: Scrim): Promise<void> {
    // Implementation...
  }
}
```

**Benefits:**
- Type-safe compile-time checking
- No serialization/deserialization overhead
- Simplified error handling with try/catch
- Easy to debug and test

### 9. Testing Strategy

**Decision**: Comprehensive test coverage

**Test Structure:**
```typescript
// Unit tests for template rendering
describe('NotificationTemplateService', () => {
  it('should render Handlebars template with data', () => {
    const template = 'Hello {{name}}!';
    const data = { name: 'World' };
    expect(service.render(template, data)).toBe('Hello World!');
  });
});

// Integration tests for notification flows
describe('ScrimNotificationFlow', () => {
  it('should send scrim completed notification', async () => {
    const scrim = createMockScrim();
    await notificationService.sendScrimCompleted(scrim);
    
    expect(botService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            title: 'Scrim Completed'
          })
        ])
      })
    );
  });
});
```

**Coverage Targets:**
- Unit tests: 90%+ for template rendering, message formatting
- Integration tests: All notification flows (scrim, match, submission)
- E2E tests: Complete user journeys
- Overall target: 80% minimum coverage

## Implementation Roadmap

### Phase 1: Foundation (1 week)
- [ ] Create TypeORM entities for notification templates and history
- [ ] Set up Handlebars.js template engine
- [ ] Create notification module structure in core
- [ ] Generate and run database migrations

### Phase 2: Core Logic Migration (1.5 weeks)
- [ ] Migrate Discord message formatting utilities
- [ ] Implement template rendering service
- [ ] Create notification history logging
- [ ] Set up error handling and retry logic

### Phase 3: Event Handlers (2 weeks)
- [ ] Migrate scrim notification handlers
- [ ] Migrate match notification handlers
- [ ] Migrate submission notification handlers
- [ ] Migrate member/player notification handlers
- [ ] Update all core services to call notification methods directly

### Phase 4: Testing & Polish (1 week)
- [ ] Write unit tests for template rendering
- [ ] Write integration tests for notification flows
- [ ] Add monitoring and logging
- [ ] Update documentation
- [ ] Performance testing and optimization

**Total Estimated Time**: 5.5 weeks

## Success Criteria

- [ ] All notification types working in monolith (scrim, match, submission, member, player)
- [ ] TypeORM entities properly defined with all relationships
- [ ] Notification history tracked in database
- [ ] Template system functional with Handlebars
- [ ] Error handling and retry logic working
- [ ] Test coverage >80%
- [ ] No performance degradation to core service
- [ ] Monitoring and alerting in place
- [ ] Documentation complete

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Discord API failures affect core | Medium | Proper error handling, circuit breaker pattern |
| Notification processing slows core | Medium | Async processing, monitoring, performance optimization |
| Template rendering errors | Low | Validation, try/catch, fallback templates |
| Database migration issues | Low | Test migrations, backup strategy, rollback plan |
| Missing notification edge cases | Medium | Comprehensive testing, gradual rollout |

## Benefits of TypeORM Integration

**Type Safety:**
- Compile-time checking of all database operations
- Automatic type inference from entity definitions
- No raw SQL queries needed

**Developer Experience:**
- IntelliSense support for all entity properties
- Automatic migration generation
- Repository pattern with built-in query builder

**Maintainability:**
- Single source of truth for database schema
- Easy relationship management
- Built-in validation and hooks

**Performance:**
- Efficient query building
- Connection pooling
- Caching support

## Conclusion

This technical design provides a comprehensive roadmap for migrating the notification service into the core monolith while leveraging TypeORM for type-safe database operations. The approach balances simplicity, maintainability, and performance while providing a solid foundation for future enhancements.