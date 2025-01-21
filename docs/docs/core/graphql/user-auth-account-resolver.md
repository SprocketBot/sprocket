---
sidebar_position: 6
title: User Auth Account Resolver
---

# User Auth Account Resolver

The User Auth Account resolver handles field resolution for user authentication accounts.

## Resolved Fields

### `user`

Resolves the user associated with an auth account.

```graphql
type UserAuthAccountObject {
  user: UserObject!
}
```

Note: This resolver currently throws a "Not yet implemented" error when the user field is not already loaded.
