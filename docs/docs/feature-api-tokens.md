# Feature Spec: API Token & Impersonation System

## Overview

Create a Personal Access Token (PAT) system that allows users to generate API tokens for third-party integrations and automations, with admin controls for token management and revocation.

## Current State

- No token-based authentication for third-party access
- Users likely use session-based authentication (cookies/JWT)
- No mechanism for users to create long-lived credentials for scripts/automations

## Target State

- Users can generate PATs with configurable scopes and expiration
- Tokens respect the user's RBAC permissions
- Admin UI to view and revoke tokens
- Rate limiting per token
- Audit logging for token usage
- Optional: OAuth2 support for third-party applications

## Design Philosophy

Per our [design philosophy](./design-philosophy.md):
- **Simplicity**: Start with simple bearer tokens; add OAuth2 only if needed
- **Security-first**: Tokens are sensitive; enforce expiration, scoping, and rate limits
- **User-friendly**: Easy to create/revoke tokens via UI
- **Auditable**: Track token creation, usage, and revocation

---

## Use Cases

### 1. User Automations
A user wants to build a Discord bot that fetches their match history and posts to a channel.
- User generates a read-only token scoped to their own data
- Bot uses token to call `GET /api/players/:id/matches`
- Token is revoked if bot is compromised

### 2. Third-Party Integrations
A user wants to integrate Sprocket data with a stats tracking website.
- User generates a token with specific scopes (`matches:read`, `stats:read`)
- Third-party app uses token to fetch data on user's behalf
- Token can be revoked at any time by user or admin

### 3. CI/CD Scripts
A developer wants to automate data exports for analytics.
- Developer generates a long-lived token with read-only access
- Script runs nightly to export data
- Token is rotated periodically for security

---

## Data Model

### ApiToken

```typescript
@Entity()
class ApiToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User; // Token acts on behalf of this user

  @Column({ unique: true })
  tokenHash: string; // SHA256 hash of the token (don't store plaintext!)

  @Column({ unique: true, nullable: true })
  tokenPrefix: string; // First 8 chars for display (e.g., 'sk_test_abc123...')

  @Column()
  name: string; // User-provided name (e.g., 'Discord Bot', 'Stats Exporter')

  @Column({ type: 'text', array: true, nullable: true })
  scopes: string[]; // e.g., ['matches:read', 'stats:read', 'profile:write']

  @Column({ nullable: true })
  expiresAt: Date; // Optional expiration

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @Column({ default: 0 })
  usageCount: number; // Total number of requests made with this token

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  revokedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  revokedBy: User; // Admin who revoked it, or null if user revoked

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // IP whitelist, user agent, etc.
}
```

### ApiTokenUsageLog

Track token usage for security monitoring:

```typescript
@Entity()
class ApiTokenUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ApiToken)
  token: ApiToken;

  @Column()
  endpoint: string; // e.g., '/api/players/123/matches'

  @Column()
  method: string; // GET, POST, etc.

  @Column({ type: 'int' })
  statusCode: number; // HTTP status code

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  wasBlocked: boolean; // True if rate limited or permission denied
}
```

---

## Token Format

### Structure

Use a standard format similar to GitHub PATs:

```
<prefix>_<environment>_<random>
```

Example:
```
sk_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

- **Prefix**: `sk` (secret key)
- **Environment**: `prod`, `dev`, `test`
- **Random**: 32-character alphanumeric string (base62 encoded UUID)

### Storage

- **Never store plaintext tokens** in the database
- Hash tokens with SHA256 before storage
- Store `tokenPrefix` (first 8 chars) for display purposes (e.g., "sk_prod_a1b2c3d4...")

### Generation Flow

1. User clicks "Create Token" in UI
2. Backend generates random token string
3. Backend hashes token with SHA256 → store in `tokenHash`
4. Backend extracts first 8 chars → store in `tokenPrefix`
5. Backend returns full token **once** to user
6. User copies token (never shown again)

---

## Token Scopes

### Scope Syntax

Scopes follow the pattern: `<resource>:<action>`

Examples:
- `matches:read` - Read match data
- `stats:read` - Read player/team stats
- `profile:write` - Update own profile
- `roster:manage` - Manage roster (if user has permission)
- `*:*` - Full access (dangerous, admin only)

### Scope Validation

Scopes **restrict** the user's existing permissions; they don't grant new ones.

**Example**:
- User has RBAC permission: `roster:manage:own_team`
- User creates token with scope: `roster:manage`
- Token can only manage rosters the user already has permission to manage
- Token **cannot** be used for actions outside its scopes (e.g., `matches:read` if not in scopes)

**Implementation**:
```typescript
async validateTokenAccess(
  token: ApiToken,
  resource: string,
  action: string
): Promise<boolean> {
  // Check if token has required scope
  const scopeRequired = `${resource}:${action}`;
  const hasScope = token.scopes.includes(scopeRequired) || token.scopes.includes('*:*');
  if (!hasScope) return false;

  // Check if user has RBAC permission
  return this.rbacService.enforce(token.user.id, resource, action, scope);
}
```

---

## Rate Limiting

### Per-Token Rate Limits

Prevent abuse by limiting requests per token:

- **Default**: 1000 requests/hour per token
- **Configurable**: Admins can adjust limits per token
- **Burst allowance**: Allow short bursts (e.g., 100 requests in 1 minute)

### Implementation

Use a rate limiting library (e.g., `nestjs-rate-limiter` or Redis-based) with token ID as key:

```typescript
@UseGuards(ApiTokenGuard, RateLimitGuard)
@RateLimit({ keyPrefix: 'api-token', points: 1000, duration: 3600 })
async getMatches(@Token() token: ApiToken) {
  // ...
}
```

### Response Headers

Include rate limit info in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1634567890
```

---

## Admin UI

### User-Facing UI

**Token Management Screen**:
```
+------------------------------------------+
| API Tokens                    [+ Create] |
+------------------------------------------+
| Name            | Scopes      | Expires   | Last Used | Actions   |
+------------------------------------------+
| Discord Bot     | matches:read| 2025-12-31| 2 days ago| [Revoke]  |
| Stats Exporter  | stats:read  | Never     | 1 hour ago| [Revoke]  |
+------------------------------------------+
```

**Token Creation Flow**:
1. User clicks "Create Token"
2. Modal appears:
   - Name: [text input]
   - Scopes: [multi-select checkboxes]
   - Expiration: [date picker or "Never"]
3. User clicks "Create"
4. Backend generates token
5. Modal shows token **once**: "Copy this token now. You won't see it again."
6. User copies token and closes modal

### Admin UI

**All Tokens View** (admin only):
```
+------------------------------------------+
| All API Tokens                           |
+------------------------------------------+
| User      | Name          | Scopes       | Created   | Actions      |
+------------------------------------------+
| shuckle   | Discord Bot   | matches:read | 2 days ago| [View][Revoke] |
| Nigel     | Stats Export  | stats:read   | 1 week ago| [View][Revoke] |
+------------------------------------------+
```

**Token Detail View** (admin only):
- Token metadata (prefix, scopes, expiration)
- Usage statistics (total requests, last used)
- Recent usage log (last 100 requests)
- Revoke button

---

## API Endpoints

### User Endpoints

- `GET /api/tokens` - List user's tokens (shows prefix, name, scopes, not full token)
- `POST /api/tokens` - Create a new token (returns full token **once**)
  - Body: `{ name, scopes, expiresAt? }`
- `DELETE /api/tokens/:id` - Revoke own token

### Admin Endpoints

- `GET /admin/tokens` - List all tokens (with filters: user, scope, revoked)
- `GET /admin/tokens/:id` - Get token details and usage logs
- `DELETE /admin/tokens/:id` - Revoke any token
- `GET /admin/tokens/:id/usage` - Get detailed usage logs for a token

### Authentication Endpoint

- `POST /auth/token` - Authenticate with token (returns session or validates token)

---

## Authentication Flow

### Using a Token

**Request**:
```http
GET /api/players/123/matches
Authorization: Bearer sk_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Backend Processing**:
1. Extract token from `Authorization` header
2. Hash token with SHA256
3. Look up `ApiToken` by `tokenHash`
4. Check if token is revoked or expired
5. Validate scopes for requested endpoint
6. Validate RBAC permissions for token's user
7. Rate limit check
8. Log usage in `ApiTokenUsageLog`
9. Proceed with request or deny

**Response** (if denied):
```http
HTTP/1.1 403 Forbidden
{
  "error": "Insufficient scope",
  "required": "matches:read",
  "provided": ["stats:read"]
}
```

---

## Security Considerations

### 1. Token Leakage

**Risk**: User accidentally commits token to GitHub or shares publicly.

**Mitigations**:
- Educate users on token security
- Provide "Last Used" timestamp to detect unauthorized usage
- Allow easy revocation via UI
- Consider IP whitelisting (optional metadata)

### 2. Privilege Escalation

**Risk**: Token grants more permissions than user has.

**Mitigation**: Tokens are **always** limited by user's RBAC permissions. Scopes only narrow permissions, never expand.

### 3. Rate Limit Bypass

**Risk**: User creates multiple tokens to bypass rate limits.

**Mitigation**: Also enforce rate limits per user (aggregate across all tokens).

### 4. Token Rotation

**Risk**: Long-lived tokens become security liabilities.

**Best Practice**:
- Encourage users to set expiration dates
- Provide warnings for tokens older than 1 year
- Optionally force rotation for high-privilege tokens

---

## Optional: OAuth2 Support

### When to Add

If third-party applications need to act on behalf of users **without sharing tokens**:

**Example**: A third-party app wants to integrate Sprocket data but shouldn't have user's full token.

### OAuth2 Flow

1. User authorizes third-party app (OAuth consent screen)
2. App receives authorization code
3. App exchanges code for access token
4. App uses access token to call API on user's behalf

### Implementation

Use a library like `@nestjs/passport` with OAuth2 strategy.

**Recommendation**: **Not needed for MVP**. Start with simple PATs. Add OAuth2 if third-party integrations become common.

---

## Tasks Breakdown

### Database Schema
- [ ] Create `ApiToken` entity and migration
- [ ] Create `ApiTokenUsageLog` entity and migration
- [ ] Add indexes for token lookup and usage logs

### Backend Services
- [ ] Implement token generation service (random string + hash)
- [ ] Implement token authentication guard (validate token, check scopes, RBAC)
- [ ] Implement rate limiting per token
- [ ] Implement usage logging (log every request)
- [ ] Implement token CRUD (create, list, revoke)

### User UI
- [ ] Create token management screen (list user's tokens)
- [ ] Create token creation flow (modal with name, scopes, expiration)
- [ ] Create token revocation flow (confirm and delete)
- [ ] Show token **once** after creation (with copy button)

### Admin UI
- [ ] Create all tokens list (filter by user, scope, revoked status)
- [ ] Create token detail view (metadata, usage stats, logs)
- [ ] Create admin token revocation flow

### Integration
- [ ] Add token authentication to all API endpoints
- [ ] Integrate token scopes with RBAC enforcement
- [ ] Add rate limiting middleware
- [ ] Add usage logging middleware

### Testing
- [ ] Unit tests for token generation and hashing
- [ ] Unit tests for scope validation
- [ ] Integration tests for token authentication flow
- [ ] Integration tests for rate limiting
- [ ] Security tests for privilege escalation

### Documentation
- [ ] User guide for creating and managing tokens
- [ ] Admin guide for monitoring and revoking tokens
- [ ] API documentation for token endpoints
- [ ] Security best practices for token usage

---

## Open Questions & Design Decisions

### 1. Token Expiration Defaults

**Question**: Should tokens have a default expiration, or allow "never expires"?

**Options**:
- A) Default 1 year, optional "never expires"
- B) Force expiration (max 2 years)
- C) No default, user chooses

**Recommendation**: **Option A** - Default 1 year with option for "never expires" (warn user).

### 2. Scope Granularity

**Question**: How granular should scopes be?

**Options**:
- A) Coarse-grained: `read`, `write`, `admin`
- B) Resource-level: `matches:read`, `stats:read`, `roster:manage`
- C) Endpoint-level: `/api/matches:read`, `/api/stats:read`

**Recommendation**: **Option B** - Resource-level scopes provide good balance of flexibility and simplicity.

### 3. Token Prefix Uniqueness

**Question**: Should token prefixes be globally unique (for display)?

**Recommendation**: Yes, use UUIDs to ensure uniqueness even if multiple tokens are created simultaneously.

### 4. Usage Logging Retention

**Question**: How long should we keep `ApiTokenUsageLog` entries?

**Options**:
- A) Forever (audit trail)
- B) 90 days (compliance)
- C) 30 days (space-saving)

**Recommendation**: **Option B** - 90 days, with option to export logs before deletion.

---

## Success Criteria

- [ ] Users can create tokens via UI
- [ ] Tokens are never stored in plaintext
- [ ] Tokens respect RBAC permissions and scopes
- [ ] Rate limiting prevents abuse
- [ ] Admins can view and revoke any token
- [ ] Usage logs track all token activity
- [ ] API responds with clear error messages for invalid tokens
- [ ] Documentation covers token creation and security best practices

---

## Performance Considerations

### Token Lookup Optimization

- Index `tokenHash` for fast lookups (O(1) with hash index)
- Cache valid tokens in-memory (TTL 5 minutes) to reduce DB queries

### Usage Log Volume

- `ApiTokenUsageLog` can grow large; partition by month
- Consider async logging (don't block request) if performance suffers
- Aggregate logs for reporting (daily/weekly summaries)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Token leakage (GitHub, logs) | Education; easy revocation; IP whitelisting |
| Privilege escalation via scopes | Scopes only narrow permissions; always check RBAC |
| Rate limit bypass (multiple tokens) | Aggregate rate limits per user |
| Long-lived tokens become liabilities | Warnings for old tokens; encourage expiration |
| Brute-force token guessing | Use 256-bit entropy; rate limit authentication attempts |

---

## Related Documents

- [Roadmap](./roadmap.md)
- [RBAC System](./feature-rbac-system.md) (tokens respect RBAC permissions)
- [Design Philosophy](./design-philosophy.md)
