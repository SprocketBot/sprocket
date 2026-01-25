# Player Resolver Interface Documentation

This document describes the GraphQL mutations and queries available in `PlayerResolver`.

## Common Types

### `OperationError`

Used to return success messages or error details when an operation does not return a data object or fails.

``` graphql
type OperationError {
  message: String!
  code: Int
}
```

## Mutations

### `intakeUserBulk`

**Description:** Bulk intakes users from CSV files. This mutation parses uploaded CSV files, validates the data against a schema, and creates new users and players in the system.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `files`: `[Upload!]!` - An array of CSV files to process.

**CSV Format:** Headers: `name`, `discordId`,`playersToLink`

- Example row: `"Nigel Thornbrake", "104751301690204160", [{"gameSkillGroupId":7,"salary":10.5}, {"gameSkillGroupId":3,"salary":14.0}]`

**GraphQL Example:**

``` graphql
mutation IntakeUserBulk($files: [Upload!]!) {
  intakeUserBulk(files: $files)
}
```

**Returns:**

- `[String!]!`: An array of error messages. If empty, all records processed successfully.

------------------------------------------------------------------------

### `intakeUser`

**Description:** Intakes a single user. Creates a new user (if they don't exist), links their Discord account, and creates player records for specified game skill groups.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `name`: `String!`
- `discord_id`: `String!`
- `playersToLink`: `[CreatePlayerTuple!]!`

**Input Types:**

- `CreatePlayerTuple`: `{ gameSkillGroupId: Int!, salary: Float! }`

**Returns:**

- `IntakeUserResult`: Union of `Player` | `OperationError`

**GraphQL Example:**

``` graphql
mutation IntakeUser($name: String!, $discordId: String!, $playersToLink: [CreatePlayerTuple!]!) {
  intakeUser(name: $name, discord_id: $discordId, playersToLink: $playersToLink) {
    ... on Player {
      id
      member {
        profile {
          name
        }
      }
    }
    ... on OperationError {
      message
      code
    }
  }
}
```

``` graphql
variables {
  "name": "Nigel Thornbrake",
  "discord_id": "104751301690204160",
  "playersToLink": [
    {
      "gameSkillGroupId": 7,
      "salary": 10.5
    },
    {
      "gameSkillGroupId": 3,
      "salary": 14.0
    }
  ]
}
```

If you prefer to not use variables and specify the inputs directly, you can combine the two above:

``` graphql
mutation IntakeUser {
  intakeUser(
    "name": "Nigel Thornbrake",
    "discord_id": "104751301690204160",
    "playersToLink": [
      {
        "gameSkillGroupId": 7,
        "salary": 10.5
      },
      {
        "gameSkillGroupId": 3,
        "salary": 14.0
      }
    ]
  ) {
    ... on Player {
      id
      member {
        profile {
          name
        }
      }
    }
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `changePlayerSkillGroupBulk`

**Description:** Bulk changes player skill groups using CSV files.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `files`: `[Upload!]!`

**Returns:**

- `ChangePlayerSkillGroupResult`: Union of `Player` | `OperationError` (Typically returns `OperationError` on success for bulk ops).

**GraphQL Example:**

``` graphql
mutation ChangePlayerSkillGroupBulk($files: [Upload!]!) {
  changePlayerSkillGroupBulk(files: $files) {
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `changePlayerSkillGroup`

**Description:** Changes a single player's skill group.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `playerId`: `Int!`
- `salary`: `Float!`
- `skillGroupId`: `Int!`
- `silent`: `Boolean` (Optional)

**Returns:**

- `ChangePlayerSkillGroupResult`: Union of `Player` | `OperationError`

**GraphQL Example:**

``` graphql
mutation ChangePlayerSkillGroup($playerId: Int!, $salary: Float!, $skillGroupId: Int!) {
  changePlayerSkillGroup(playerId: $playerId, salary: $salary, skillGroupId: $skillGroupId) {
    ... on Player {
      id
      salary
      skillGroup {
        id
        profile {
          description
        }
      }
    }
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `createPlayer`

**Description:** Creates a new player record for an existing member.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `memberId`: `Int!`
- `skillGroupId`: `Int!`
- `salary`: `Float!`

**Returns:**

- `CreatePlayerResult`: Union of `Player` | `OperationError`

**GraphQL Example:**

``` graphql
mutation CreatePlayer($memberId: Int!, $skillGroupId: Int!, $salary: Float!) {
  createPlayer(memberId: $memberId, skillGroupId: $skillGroupId, salary: $salary) {
    ... on Player {
      id
      salary
      skillGroup {
        id
        ordinal
      }
    }
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `swapDiscordAccounts`

**Description:** Swaps a user's Discord account ID.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `newAcct`: `String!`
- `oldAcct`: `String!`

**Returns:**

- `SwapDiscordAccountsResult`: Union of `OperationError`

**GraphQL Example:**

``` graphql
mutation SwapDiscordAccounts($newAcct: String!, $oldAcct: String!) {
  swapDiscordAccounts(newAcct: $newAcct, oldAcct: $oldAcct) {
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `forcePlayerToTeam`

**Description:** Forces a player to a specific team (MLEDB specific).

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `mleid`: `Int!`
- `newTeam`: `String!`

**Returns:**

- `ForcePlayerToTeamResult`: Union of `OperationError`

**GraphQL Example:**

``` graphql
mutation ForcePlayerToTeam($mleid: Int!, $newTeam: String!) {
  forcePlayerToTeam(mleid: $mleid, newTeam: $newTeam) {
    ... on OperationError {
      message
      code
    }
  }
}
```

------------------------------------------------------------------------

### `changePlayerName`

**Description:** Changes a player's name.

**Permissions:** Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `mleid`: `Int!`
- `newName`: `String!`

**Returns:**

- `ChangePlayerNameResult`: Union of `OperationError`

**GraphQL Example:**

``` graphql
mutation ChangePlayerName($mleid: Int!, $newName: String!) {
  changePlayerName(mleid: $mleid, newName: $newName) {
    ... on OperationError {
      message
      code
    }
  }
}
```

## Queries (Field Resolvers on `Player`)

These are fields available on the `Player` type that are resolved dynamically.

### `skillGroup`

**Description:** Resolves the `skillGroup` field for a `Player`.

**GraphQL Example:**

``` graphql
query GetPlayerSkillGroup($playerId: Int!) {
  getPlayer(id: $playerId) {
    skillGroup {
      id
      profile {
        description
      }
    }
  }
}
```

**Returns:**

- `GameSkillGroup!`

------------------------------------------------------------------------

### `franchiseName`

**Description:** Resolves the `franchiseName` field for a `Player`.

**GraphQL Example:**

``` graphql
query GetPlayerFranchiseName($playerId: Int!) {
  getPlayer(id: $playerId) {
    franchiseName
  }
}
```

**Returns:**

- `String!`

------------------------------------------------------------------------

### `franchisePositions`

**Description:** Resolves the `franchisePositions` field for a `Player`.

**GraphQL Example:**

``` graphql
query GetPlayerFranchisePositions($playerId: Int!) {
  getPlayer(id: $playerId) {
    franchisePositions
  }
}
```

**Returns:**

- `[String!]!`

------------------------------------------------------------------------

### `member`

**Description:** Resolves the `member` field for a `Player`.

**GraphQL Example:**

``` graphql
query GetPlayerMember($playerId: Int!) {
  getPlayer(id: $playerId) {
    member {
      id
      profile {
        name
      }
    }
  }
}
```

**Returns:**

- `Member!`
