---
sidebar_position: 2
title: Game Resolver
---

# Game Resolver

The Game resolver handles queries and field resolutions for game-related data.

## Queries

### `games`

Returns a list of all games.

```graphql
Query {
  games: [GameObject!]!
}
```

**Authorization Required:**

- Resource: Game
- Action: Read
- Possession: ANY

## Resolved Fields

### `skillGroups`

Resolves the skill groups associated with a game.

```graphql
type GameObject {
  skillGroups: [SkillGroupObject!]!
}
```

### `gameModes`

Resolves the game modes associated with a game.

```graphql
type GameObject {
  gameModes: [GameModeObject!]!
}
```
