# Core Service Agent Instructions

## Service Overview

**Workspace:** `core/`
**Type:** NestJS GraphQL API Service
**Port:** 3001
**Health Endpoint:** `http://localhost:3001/healthz`
**GraphQL Endpoint:** `http://localhost:3001/graphql`

## Module Responsibility

The core service is the central API layer for Sprocket, handling:
- GraphQL API for all platform operations
- Authentication and authorization
- Database operations (TypeORM + PostgreSQL)
- Business logic for leagues, scrims, submissions, and organizations
- Message queue integration (RabbitMQ)
- Cache management (Redis)
- Object storage (MinIO/S3)

## Key Architectural Patterns

### 1. Module Structure

Core uses NestJS modules organized by domain:

```
core/src/
├── organization/     # Org/team/member management
├── scrim/           # Scrim queue and matchmaking
├── submission/      # Replay submission handling
├── scheduling/      # Match/round/fixture scheduling
├── replay-parse/    # Replay processing coordination
├── mledb/           # Legacy MLE database bridge
├── notification/    # User notifications
└── util/            # Shared utilities
```

### 2. GraphQL-First Design

- All public APIs exposed via GraphQL
- Resolvers in `*.resolver.ts` files
- Services contain business logic
- Controllers used for non-GraphQL endpoints

**Pattern:**
```typescript
// Resolver (GraphQL layer)
@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private organizationService: OrganizationService) {}
  
  @Query(() => Organization)
  async organization(@Args('id') id: string) {
    return this.organizationService.findOne(id);
  }
}

// Service (business logic)
@Injectable()
export class OrganizationService {
  async findOne(id: string): Promise<Organization> {
    // Business logic here
  }
}
```

### 3. Database Access

- TypeORM for ORM
- Entities in `core/src/<module>/<module>.entity.ts`
- Repositories injected via `@InjectRepository()`
- Migrations in `core/src/migration/`

**Pattern:**
```typescript
@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private repo: Repository<Organization>,
  ) {}
  
  async create(data: CreateOrganizationInput): Promise<Organization> {
    return this.repo.save(data);
  }
}
```

### 4. Message Queue Integration

- RabbitMQ via `@nestjs/microservices`
- Common clients in `common/src/service-connectors/`
- Producers send messages, consumers handle them

**Pattern:**
```typescript
@Injectable()
export class ScrimService {
  constructor(
    @Inject(CommonClient.Matchmaking)
    private client: ClientProxy,
  ) {}
  
  async createScrim(data: CreateScrimInput) {
    // Send to matchmaking service
    this.client.send('scrim.created', data);
  }
}
```

## Test Patterns

### Location
- Unit tests: `core/src/<module>/<module>.service.spec.ts`
- Integration tests: `core/src/<module>/e2e/`

### Test Structure
```typescript
describe('OrganizationService', () => {
  let service: OrganizationService;
  let repo: Repository<Organization>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useClass: Repository,
        },
      ],
    }).compile();
    
    service = module.get(OrganizationService);
    repo = module.get(getRepositoryToken(Organization));
  });
  
  it('should create organization', async () => {
    // Test implementation
  });
});
```

### Running Tests
```bash
# All core tests
npm run test --workspace=core

# Specific test file
npm run test --workspace=core -- src/organization/organization.service.spec.ts

# With coverage
npm run test --workspace=core -- --coverage
```

## Common Pitfalls

### ❌ Anti-Patterns

1. **Business logic in resolvers**
   ```typescript
   // BAD: Logic in resolver
   @Resolver()
   class OrganizationResolver {
     async create(@Args('input') input: CreateInput) {
       // Business logic here ❌
       if (!input.name) throw new Error('Name required');
       return this.repo.save(input);
     }
   }
   ```

2. **Direct database access from resolvers**
   ```typescript
   // BAD: Resolver accessing repo directly
   @Resolver()
   class OrganizationResolver {
     constructor(
       @InjectRepository(Organization)
       private repo: Repository<Organization>, // ❌
     ) {}
   }
   ```

3. **Missing error handling in async operations**
   ```typescript
   // BAD: No error handling
   async processReplay(id: string) {
     const replay = await this.repo.findOne(id); // Might throw
     return this.parse(replay); // Might throw
   }
   ```

### ✅ Best Practices

1. **Thin resolvers, fat services**
   ```typescript
   // GOOD: Resolver delegates to service
   @Resolver()
   class OrganizationResolver {
     constructor(private service: OrganizationService) {}
     
     async create(@Args('input') input: CreateInput) {
       return this.service.create(input); // ✅
     }
   }
   ```

2. **Use GraphQL error types**
   ```typescript
   // GOOD: Proper error handling
   async create(input: CreateInput) {
     try {
       return await this.service.create(input);
     } catch (error) {
       if (error instanceof UniqueConstraintError) {
         throw new UserInputError('Name already exists');
       }
       throw error;
     }
   }
   ```

3. **Validate input at GraphQL layer**
   ```typescript
   // GOOD: Input validation
   @InputType()
   class CreateOrganizationInput {
     @Field()
     @IsString()
     @MinLength(3)
     name: string;
   }
   ```

## Architectural Rules

### Business Logic Placement
- ✅ Services (`*.service.ts`)
- ✅ Guards (`*.guard.ts`)
- ✅ Interceptors (`*.interceptor.ts`)
- ❌ Resolvers (GraphQL layer only)
- ❌ Controllers (non-GraphQL endpoints only)
- ❌ Entities (data models only)

### Cross-Service Changes
When modifying core in ways that affect other services:

1. **Check service-manifest.json** for dependencies
2. **Update common clients** if message contracts change
3. **Version message schemas** for backwards compatibility
4. **Document breaking changes** in PR description

### Configuration Handling
- ✅ Use `@nestjs/config` for env vars
- ✅ Define config schema with `Joi` or `zod`
- ✅ Provide defaults for local development
- ❌ Hardcode configuration values
- ❌ Commit secrets to repository

## Module Boundaries

### High-Coupling Modules (change together)
- `organization/` + `member/`
- `scrim/` + `matchmaking/`
- `submission/` + `replay-parse/`
- `scheduling/` + `match/`

### Low-Coupling Modules (can change independently)
- `notification/`
- `util/`
- `sprocket-rating/`
- `analytics/`

## Debugging Commands

```bash
# View core logs
npm run dev:logs -- core

# GraphQL health check
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'

# Access database
docker-compose exec postgres psql -U sprocketbot -d sprocket

# Check RabbitMQ queues
docker-compose exec rabbitmq rabbitmq-diagnostics list_queues

# Check Redis cache
docker-compose exec redis redis-cli
```

## Common Tasks

### Adding a New GraphQL Mutation

1. Create input type: `src/<module>/dto/create-<entity>.input.ts`
2. Create service method: `src/<module>/<entity>.service.ts`
3. Add resolver mutation: `src/<module>/<entity>.resolver.ts`
4. Add tests: `src/<module>/<entity>.service.spec.ts`
5. Update schema documentation

### Adding a New Database Entity

1. Create entity: `src/<module>/<entity>.entity.ts`
2. Create migration: `npm run migration:generate -- src/migration/CreateEntity`
3. Review and apply migration: `npm run migration:run`
4. Add repository to module: `src/<module>/<module>.module.ts`
5. Create service methods

### Integrating with Microservice

1. Add client to module: `src/<module>/<module>.module.ts`
2. Inject client in service
3. Send messages with proper schema
4. Handle responses/errors
5. Add integration tests

## Testing Requirements

### For All Changes
- [ ] Unit tests for new service methods
- [ ] GraphQL mutation/query tests
- [ ] Error case coverage
- [ ] Integration tests for cross-module changes

### For Database Changes
- [ ] Migration tested locally
- [ ] Rollback tested (down migration)
- [ ] Data integrity verified

### For API Changes
- [ ] Backwards compatibility checked
- [ ] Deprecation path documented (if breaking)
- [ ] Client impact assessed

## Related Documentation

- **Root AGENTS.md:** `../../AGENTS.md`
- **Task Protocol:** `../../reports/agent-task-protocol.md`
- **Harness Charter:** `../../reports/agent-harness-charter.md`
- **Local Runtime:** `../../reports/agent-harness-local-runtime.md`
- **Service Manifest:** `../../scripts/harness/service-manifest.json`
