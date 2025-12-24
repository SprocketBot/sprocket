# GraphQL API

The GraphQL API exposes the core database entities for querying.

## Core Entities

All entities in the core database are capable of being queried by ID.

### Queries

- `getMatchById(id: String!): Match`
- `getMatchSubmissionById(id: String!): MatchSubmission`
- `getRoundById(id: String!): Round`
- `getScheduleGroupById(id: String!): ScheduleGroup`
- `getScheduleGroupTypeById(id: String!): ScheduleGroupType`
- `getTeamStatById(id: String!): TeamStat`
- `getPlayerStatById(id: String!): PlayerStat`
- `getScrimQueueById(id: String!): ScrimQueue`
- `getScrimTimeoutById(id: String!): ScrimTimeout`
- `getEventQueueById(id: String!): EventQueue`
- `getMetricsById(id: String!): Metrics`
- `getLogsById(id: String!): Logs`
- `getUserNotificationPreferenceById(id: String!): UserNotificationPreference`
- `getNotificationHistoryById(id: String!): NotificationHistory`
- `getNotificationTemplateById(id: String!): NotificationTemplate`
- `getFixtureById(id: String!): Fixture`

## Invariant Testing

A schema invariant test ensures that every DB entity has a corresponding GraphQL object type.
See `core/src/schema-invariants.spec.ts`.
