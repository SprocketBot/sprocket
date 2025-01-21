---
sidebar_position: 5
title: Scrim Resolver
---

# Scrim Resolver

The Scrim resolver provides real-time scrim management functionality through queries, mutations, and subscriptions.

## Subscriptions

### `currentScrim`

Subscribes to updates for the current scrim.

```graphql
Subscription {
  currentScrim: ScrimObject
}
```

### `pendingScrims`

Subscribes to updates for pending scrims.

```graphql
Subscription {
  pendingScrims: ScrimObject
}
```

### `allScrims`

Subscribes to updates for all scrims.

```graphql
Subscription {
  allScrims: ScrimObject
}
```

All scrim-related operations require authorization through the `AuthorizeGuard`.

## Participant Resolution

The ScrimParticipantResolver handles user name resolution for scrim participants:

```graphql
type ScrimParticipantObject {
  name: String!
}
```
