import { z } from 'zod';

export const MatchDatabaseIdsSchema = z.object({
  id: z.number(),
  legacyId: z.number(),
});

export type MatchDatabaseIds = z.infer<typeof MatchDatabaseIdsSchema>;
