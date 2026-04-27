# Agent Architecture Rules

## Purpose

This document defines the architectural rules and constraints that all agents must follow when making changes to the Sprocket codebase. These rules prevent architectural drift and maintain system integrity.

**Status:** ENFORCED - Violations require explicit human review and justification.

---

## Rule 1: Business Logic Placement

### Rule Statement
Business logic MUST reside in service layer, NOT in presentation or transport layers.

### Rationale
- Separation of concerns
- Testability
- Reusability across different interfaces (GraphQL, REST, message queue)
- Prevents UI from becoming source of truth for policy

### Enforcement

**✅ Allowed:**
```typescript
// Service layer (GOOD)
@Injectable()
export class OrganizationService {
  async createOrganization(input: CreateOrgInput): Promise<Organization> {
    // Business logic here ✅
    if (input.members.length > MAX_MEMBERS) {
      throw new MaxMembersExceededError();
    }
    return this.repo.save(input);
  }
}
```

**❌ Forbidden:**
```typescript
// Resolver/Controller (BAD)
@Resolver()
class OrganizationResolver {
  async createOrganization(input: CreateOrgInput): Promise<Organization> {
    // Business logic in resolver ❌
    if (input.members.length > 100) {
      throw new Error('Too many members');
    }
    return this.repo.save(input);
  }
}
```

### Validation
- Check that resolvers/controllers only delegate to services
- Services should contain validation, calculations, and business rules
- Resolvers should only handle GraphQL concerns (field resolution, error transformation)

### Exceptions
None. This is a core architectural principle.

---

## Rule 2: Cross-Service Change Documentation

### Rule Statement
Changes affecting multiple services MUST explicitly document all affected services and contracts.

### Rationale
- Prevents breaking changes in distributed system
- Ensures all service owners are aware of changes
- Maintains contract compatibility

### Enforcement

**✅ Required Documentation:**
```markdown
## Cross-Service Impact

**Affected Services:**
- Core API (this change)
- Submission Service (message contract change)
- Matchmaking Service (event consumer)

**Changed Contracts:**
- `ScrimCreated` event schema (added `priority` field)
- RabbitMQ queue: `scrim.events` (backwards compatible)

**Backwards Compatibility:**
- New field is optional
- Old consumers will ignore new field
- No breaking changes
```

**❌ Forbidden:**
- Changing message schemas without documentation
- Modifying shared types without updating all consumers
- Breaking API contracts without versioning

### Validation
- PR description must list affected services
- Service manifest must be updated if service dependencies change
- Integration tests must cover cross-service interactions

### Exceptions
None. Cross-service changes always require documentation.

---

## Rule 3: Configuration Handling

### Rule Statement
Configuration MUST use environment variables through typed configuration objects, NOT hardcoded values.

### Rationale
- Environment-specific configuration
- Security (secrets not in code)
- Testability (easy to mock configuration)
- Deployment flexibility

### Enforcement

**✅ Allowed:**
```typescript
// Typed configuration (GOOD)
@Injectable()
export class ConfigService {
  get databaseUrl(): string {
    return process.env.DATABASE_URL; // ✅
  }
  
  get matchmakingConfig(): MatchmakingConfig {
    return {
      maxRatingDiff: parseInt(process.env.MATCHMAKING_MAX_RATING_DIFF || '100'),
      minPlayers: parseInt(process.env.MATCHMAKING_MIN_PLAYERS || '4'),
    };
  }
}
```

**❌ Forbidden:**
```typescript
// Hardcoded configuration (BAD)
class SomeService {
  async connect() {
    const dbUrl = 'postgresql://localhost:5432/mydb'; // ❌ Hardcoded
    const apiKey = 'sk-1234567890abcdef'; // ❌ Secret in code
  }
}
```

### Validation
- No hardcoded connection strings
- No secrets in source code
- All configuration accessible via environment variables
- Configuration schemas validated at startup

### Exceptions
- Default values for local development are acceptable if documented
- Feature flags with sensible defaults are acceptable

---

## Rule 4: Database Migration Safety

### Rule Statement
Database migrations MUST be additive and backwards compatible. Destructive migrations require explicit human review.

### Rationale
- Zero-downtime deployments
- Rollback capability
- Data safety
- Multiple application versions running simultaneously

### Enforcement

**✅ Allowed (Additive):**
```sql
-- Adding new column (GOOD)
ALTER TABLE "organization" ADD COLUMN "priority" INTEGER DEFAULT 0;

-- Creating new table (GOOD)
CREATE TABLE "audit_log" (
  id UUID PRIMARY KEY,
  action VARCHAR(255) NOT NULL
);

-- Adding index (GOOD)
CREATE INDEX "idx_organization_priority" ON "organization"("priority");
```

**❌ Forbidden Without Human Review (Destructive):**
```sql
-- Dropping column (BAD - requires review)
ALTER TABLE "organization" DROP COLUMN "old_field";

-- Renaming column (BAD - requires review)
ALTER TABLE "organization" RENAME COLUMN "old_name" TO "new_name";

-- Changing column type (BAD - requires review)
ALTER TABLE "organization" ALTER COLUMN "score" TYPE TEXT;
```

### Validation
- Migrations reviewed for backwards compatibility
- Rollback migrations tested
- Data migration scripts preserve existing data

### Exceptions
None for production databases. Local development migrations can be destructive.

---

## Rule 5: API Versioning

### Rule Statement
Breaking API changes MUST be versioned. Existing API versions must remain functional for a minimum deprecation period.

### Rationale
- Client compatibility
- Gradual migration path
- Reduced deployment risk

### Enforcement

**✅ Allowed:**
```typescript
// Versioned API (GOOD)
@Resolver(() => OrganizationV2)
class OrganizationV2Resolver {
  @Query(() => OrganizationV2)
  async organization(@Args('id') id: string): Promise<OrganizationV2> {
    // New version with breaking changes
  }
}

// Deprecation notice (GOOD)
/**
 * @deprecated Use organizationV2 instead. Will be removed in v2.5.0
 */
@Resolver(() => Organization)
class OrganizationResolver {
  // Old version still functional
}
```

**❌ Forbidden:**
- Removing fields without deprecation period
- Changing field types without versioning
- Breaking query/mutation signatures without version bump

### Validation
- Deprecation notices in GraphQL schema
- Deprecation period minimum 1 release cycle
- Migration guide for breaking changes

### Exceptions
- Security vulnerabilities may require immediate breaking changes
- Critical bugfixes that don't change API surface

---

## Rule 6: Error Handling Discipline

### Rule Statement
All async operations MUST have explicit error handling. Silent failures are forbidden.

### Rationale
- Debuggability
- System reliability
- User experience
- Monitoring and alerting

### Enforcement

**✅ Allowed:**
```typescript
// Explicit error handling (GOOD)
async processReplay(submissionId: string): Promise<ReplayResult> {
  try {
    const replay = await this.repo.findOne(submissionId);
    if (!replay) {
      throw new NotFoundError('Submission not found');
    }
    return await this.parser.parse(replay);
  } catch (error) {
    if (error instanceof ParserError) {
      this.logger.error('Parser failed', { submissionId, error });
      throw error;
    }
    this.logger.error('Unexpected error', { submissionId, error });
    throw new InternalServerError('Replay processing failed');
  }
}
```

**❌ Forbidden:**
```typescript
// Silent failure (BAD)
async processReplay(submissionId: string): Promise<ReplayResult> {
  try {
    return await this.parser.parse(replay);
  } catch (error) {
    // Silent catch ❌
  }
}

// Generic error without context (BAD)
async processReplay(submissionId: string) {
  try {
    return await this.parser.parse(replay);
  } catch (error) {
    throw new Error('Failed'); // ❌ No context
  }
}
```

### Validation
- All try-catch blocks have logging
- Error messages include context (IDs, parameters)
- Errors are typed (not generic Error)
- Unhandled rejections are caught

### Exceptions
None. Silent failures are never acceptable.

---

## Rule 7: Secrets Management

### Rule Statement
Secrets MUST NOT be committed to source code. Use environment variables or secret management systems.

### Rationale
- Security
- Compliance
- Access control
- Audit trail

### Enforcement

**✅ Allowed:**
```typescript
// Environment variable (GOOD)
const jwtSecret = process.env.JWT_SECRET;

// Secret file (injected by infra) (GOOD)
const secret = fs.readFileSync('/run/secrets/jwt_secret', 'utf8');

// Secret management service (GOOD)
const secret = await this.secretManager.get('jwt-secret');
```

**❌ Forbidden:**
```typescript
// Hardcoded secret (BAD)
const jwtSecret = 'my-super-secret-key-12345'; // ❌

// Secret in config file (BAD)
{
  "jwtSecret": "my-super-secret-key-12345" // ❌
}

// Base64 encoded secret (still BAD)
const jwtSecret = Buffer.from('bXktc3VwZXItc2VjcmV0LWtleS0xMjM0NQ==', 'base64').toString(); // ❌
```

### Validation
- Automated secret scanning in CI
- Pre-commit hooks check for common secret patterns
- Regular security audits

### Exceptions
None. Secrets in code are never acceptable.

---

## Rule 8: Message Queue Contracts

### Rule Statement
Message queue schemas MUST be versioned and backwards compatible. Consumers must handle unknown fields gracefully.

### Rationale
- Service decoupling
- Gradual rollouts
- Consumer compatibility
- System resilience

### Enforcement

**✅ Allowed:**
```typescript
// Adding optional field (GOOD)
interface ScrimCreatedEvent {
  scrimId: string;
  players: string[];
  // New optional field (backwards compatible)
  priority?: number;
}

// Consumer handles unknown fields gracefully (GOOD)
@EventPattern('scrim.created')
async handleScrimCreated(event: ScrimCreatedEvent) {
  // Only use known fields
  const scrimId = event.scrimId;
  // Ignore unknown fields like event.priority if not needed
}
```

**❌ Forbidden:**
```typescript
// Removing required field (BAD)
interface ScrimCreatedEvent {
  // scrimId removed - breaks all consumers ❌
  players: string[];
}

// Changing field type (BAD)
interface ScrimCreatedEvent {
  scrimId: number; // Was string - breaks consumers ❌
  players: string[];
}
```

### Validation
- Schema registry for message types
- Consumer tests with old and new schemas
- Backwards compatibility checks in CI

### Exceptions
None for production message contracts.

---

## Rule 9: Logging and Observability

### Rule Statement
All services MUST implement structured logging with correlation IDs. Log levels must be appropriate.

### Rationale
- Debuggability
- Performance analysis
- Security auditing
- Incident response

### Enforcement

**✅ Allowed:**
```typescript
// Structured logging (GOOD)
this.logger.info('Scrim created', {
  scrimId: scrim.id,
  queueId: scrim.queueId,
  playerCount: scrim.players.length,
  correlationId: request.headers['x-correlation-id'],
});

// Appropriate log levels (GOOD)
this.logger.error('Database connection failed', { error }); // Error level
this.logger.warn('Queue growing large', { size }); // Warning level
this.logger.info('Request completed', { duration }); // Info level
this.logger.debug('Cache miss', { key }); // Debug level
```

**❌ Forbidden:**
```typescript
// Unstructured logging (BAD)
console.log('Scrim created ' + scrim.id + ' with ' + scrim.players.length); // ❌

// Wrong log level (BAD)
this.logger.info('Database connection failed'); // Should be error ❌
this.logger.error('Request completed'); // Should be info ❌

// No correlation ID (BAD)
this.logger.info('Request processed'); // ❌ No way to trace
```

### Validation
- Structured logging format (JSON)
- Correlation IDs in all logs
- Log level review in PRs
- Log aggregation configured

### Exceptions
None. Observability is critical for production systems.

---

## Rule 10: Test Coverage Requirements

### Rule Statement
All new code MUST have corresponding tests. Critical paths require >80% coverage.

### Rationale
- Regression prevention
- Documentation of behavior
- Confidence in changes
- Code quality

### Enforcement

**✅ Required:**
- Unit tests for all service methods
- Integration tests for cross-module interactions
- API tests for all public endpoints
- Error case coverage

**❌ Forbidden:**
- Untested new code
- Tests without assertions
- Mocking everything (no integration)

### Validation
```bash
# Minimum coverage thresholds
npm run test --workspace=core -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

### Exceptions
- UI components may have lower coverage if visual tests exist
- Configuration-only changes don't require tests
- Documentation-only changes don't require tests

---

## Enforcement Mechanisms

### Automated Checks

**CI/CD Pipeline:**
1. Lint rules enforce code patterns
2. Type checking enforces type safety
3. Test coverage thresholds
4. Secret scanning
5. Migration review flags

**Pre-commit Hooks:**
1. Format check
2. Lint check
3. Type check
4. Secret scan

### Manual Review Triggers

**Require Human Review:**
- Destructive database migrations
- Breaking API changes
- Security-impacting changes
- Cross-service contract changes
- Architecture rule violations (with justification)

---

## Violation Handling

### Process

1. **Detection:** Automated check or code review
2. **Documentation:** Violation logged in PR
3. **Resolution:** Fix violation or document exception
4. **Exception:** If violation is justified, document rationale and get human approval

### Exception Template

```markdown
## Architecture Rule Exception

**Rule Violated:** [Rule number and name]

**Justification:**
[Why this violation is necessary]

**Risk Mitigation:**
[How risks are mitigated]

**Follow-up Plan:**
[When and how this will be addressed]

**Approved By:** [Human reviewer name]
**Date:** YYYY-MM-DD
```

---

## Related Documents

- **Task Classifications:** [reports/agent-harness-charter.md](./agent-harness-charter.md)
- **Self-Review Checklist:** [reports/agent-self-review-checklist.md](./agent-self-review-checklist.md)
- **Service Manifest:** [scripts/harness/service-manifest.json](../scripts/harness/service-manifest.json)
- **Task Protocol:** [reports/agent-task-protocol.md](./agent-task-protocol.md)
