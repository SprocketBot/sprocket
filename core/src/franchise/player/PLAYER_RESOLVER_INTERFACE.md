# Player Resolver Interface Documentation

This document describes the GraphQL mutations and queries available in `PlayerResolver`.

## Mutations

### `intakeUserBulk`

**Description:**
Bulk intakes users from CSV files. This mutation parses uploaded CSV files, validates the data against a schema, and creates new users and players in the system.
**Crucially**, this supports creating multiple players for the same user (e.g. for different games). You can include multiple rows with the same `name` and `discordId` but different `skillGroupId` and `salary`. The system will ensure the user is created once and then add the players to that user.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `files`: `[Upload!]!` - An array of CSV files to process.

**CSV Format:**
The CSV files must contain the following headers:

- `name`: The user's display name.
- `discordId`: The user's Discord ID.
- `skillGroupId`: The ID of the skill group (league) the user is joining.
- `salary`: The user's salary.

**Example CSV:**

```csv
name,discordId,skillGroupId,salary
UserOne,123456789012345678,1,10.5
UserOne,123456789012345678,5,11.0
UserTwo,876543210987654321,2,15.0
```

**GraphQL Example:**

```graphql
mutation IntakeUserBulk($files: [Upload!]!) {
  intakeUserBulk(files: $files)
}
```

**Returns:**

- `[String!]!`: An array of error messages encountered during processing. If the array is empty, all records were processed successfully.

**Errors:**

- **CSV Syntax Error:** If the CSV file is malformed.
- **Validation Error:** If a row in the CSV does not match the expected schema (e.g., invalid data types, missing fields).
- **Service Error:** If an error occurs during the user creation process (e.g., database error).

---

### `intakeUser`

**Description:**
Intakes a single user. Creates a new user (if they don't exist), links their Discord account, and creates player records for specified game skill groups.
If the user already exists (identified by Discord ID), it will add the new player records to the existing user. It is idempotent regarding user creation.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `name`: `String!` - The user's display name.
- `discord_id`: `String!` - The user's Discord ID.
- `playersToLink`: `[CreatePlayerTuple!]!` - An array of objects specifying the game skill group and salary for each player record to create.

**Input Types:**

- `CreatePlayerTuple`:
  - `gameSkillGroupId`: `Int!` - The ID of the skill group.
  - `salary`: `Float!` - The salary for this specific skill group.

**GraphQL Example:**

```graphql
mutation IntakeUser($name: String!, $discordId: String!, $playersToLink: [CreatePlayerTuple!]!) {
  intakeUser(name: $name, discord_id: $discordId, playersToLink: $playersToLink) {
    id
    profile {
      displayName
    }
  }
}
```

**Variables Example:**

```json
{
  "name": "NewUser",
  "discordId": "123456789012345678",
  "playersToLink": [
    {
      "gameSkillGroupId": 1,
      "salary": 10.5
    },
    {
      "gameSkillGroupId": 5,
      "salary": 12.0
    }
  ]
}
```

**Returns:**

- `User | String`: The created (or found) `User` object on success, or an error message string on failure.

---

### `changePlayerSkillGroupBulk`

**Description:**
Bulk changes player skill groups using CSV files.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `files`: `[Upload!]!` - An array of CSV files containing player skill group change data.

**GraphQL Example:**

```graphql
mutation ChangePlayerSkillGroupBulk($files: [Upload!]!) {
  changePlayerSkillGroupBulk(files: $files)
}
```

**Returns:**

- `String!`: A string containing the results of the operation (e.g., success messages, error logs).

---

### `changePlayerSkillGroup`

**Description:**
Changes a single player's skill group.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `playerId`: `Int!` - The ID of the player.
- `salary`: `Float!` - The new salary for the player.
- `skillGroupId`: `Int!` - The ID of the new skill group.
- `silent`: `Boolean` (Optional) - If true, suppresses notifications.

**GraphQL Example:**

```graphql
mutation ChangePlayerSkillGroup($playerId: Int!, $salary: Float!, $skillGroupId: Int!) {
  changePlayerSkillGroup(playerId: $playerId, salary: $salary, skillGroupId: $skillGroupId)
}
```

**Returns:**

- `String!`: "SUCCESS" on success.

---

### `createPlayer`

**Description:**
Creates a new player record for an existing member.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `memberId`: `Int!` - The ID of the member.
- `skillGroupId`: `Int!` - The ID of the skill group.
- `salary`: `Float!` - The player's salary.

**GraphQL Example:**

```graphql
mutation CreatePlayer($memberId: Int!, $skillGroupId: Int!, $salary: Float!) {
  createPlayer(memberId: $memberId, skillGroupId: $skillGroupId, salary: $salary) {
    id
    salary
    skillGroup {
      id
      ordinal
    }
  }
}
```

**Returns:**

- `Player!`: The created `Player` object.

---

### `swapDiscordAccounts`

**Description:**
Swaps a user's Discord account ID.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `newAcct`: `String!` - The new Discord account ID.
- `oldAcct`: `String!` - The old Discord account ID.

**GraphQL Example:**

```graphql
mutation SwapDiscordAccounts($newAcct: String!, $oldAcct: String!) {
  swapDiscordAccounts(newAcct: $newAcct, oldAcct: $oldAcct)
}
```

**Returns:**

- `String!`: "Success." on success.

---

### `forcePlayerToTeam`

**Description:**
Forces a player to a specific team (MLEDB specific).

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `mleid`: `Int!` - The MLE ID of the player.
- `newTeam`: `String!` - The name of the new team.

**GraphQL Example:**

```graphql
mutation ForcePlayerToTeam($mleid: Int!, $newTeam: String!) {
  forcePlayerToTeam(mleid: $mleid, newTeam: $newTeam)
}
```

**Returns:**

- `String!`: "Success." on success.

---

### `changePlayerName`

**Description:**
Changes a player's name.

**Permissions:**
Requires `MLEDB_ADMIN` or `LEAGUE_OPERATIONS` role.

**Arguments:**

- `mleid`: `Int!` - The MLE ID of the player.
- `newName`: `String!` - The new name.

**GraphQL Example:**

```graphql
mutation ChangePlayerName($mleid: Int!, $newName: String!) {
  changePlayerName(mleid: $mleid, newName: $newName)
}
```

**Returns:**

- `String!`: "Success." on success.

## Queries

### `skillGroup`

**Description:**
Resolves the `skillGroup` field for a `Player`.

**GraphQL Example:**

```graphql
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

- `GameSkillGroup!`: The skill group associated with the player.

---

### `franchiseName`

**Description:**
Resolves the `franchiseName` field for a `Player`.

**GraphQL Example:**

```graphql
query GetPlayerFranchiseName($playerId: Int!) {
  getPlayer(id: $playerId) {
    franchiseName
  }
}
```

**Returns:**

- `String!`: The name of the franchise the player belongs to.

---

### `franchisePositions`

**Description:**
Resolves the `franchisePositions` field for a `Player`.

**GraphQL Example:**

```graphql
query GetPlayerFranchisePositions($playerId: Int!) {
  getPlayer(id: $playerId) {
    franchisePositions
  }
}
```

**Returns:**

- `[String!]!`: An array of staff positions the player holds in their franchise.

---

### `member`

**Description:**
Resolves the `member` field for a `Player`.

**GraphQL Example:**

```graphql
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

- `Member!`: The member associated with the player.
