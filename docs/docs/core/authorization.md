---
sidebar_position: 2
title: Authorization
---

# Authorization

The Core service uses a role-based access control (RBAC) system implemented through Casbin.

## Model Definition

```conf
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
```

## Implementation

Authorization is enforced through guards:

- `AuthZGuard` - For general RBAC checks
- `AuthorizeGuard` - For specific authorization scenarios

Guards are applied at the resolver level using decorators:

```typescript
@UseGuards(AuthZGuard)
@UsePermissions({
  resource: Resource.Game,
  action: ResourceAction.Read,
  possession: AuthPossession.ANY,
})
```

## Database Integration

The authorization system is integrated with the database through:

- Policy seeding (`PolicySeed` in `seed.module.ts`)
- PostgreSQL extensions (`pg_trgm` enabled via migration)
