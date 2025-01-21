---
sidebar_position: 4
title: Skill Group Resolver
---

# Skill Group Resolver

The Skill Group resolver handles queries for skill group-related data.

## Queries

### `allSkillGroups`

Returns a list of all skill groups.

```graphql
Query {
  allSkillGroups: [SkillGroupObject!]!
}
```

**Authorization Required:**

- Resource: SkillGroup
- Action: Read
- Possession: ANY
