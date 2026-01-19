import { z } from 'zod';

export const PlayerTeamChangedSchema = z.object({
  organizationId: z.number(),
  playerId: z.number(),
  discordId: z.string(),
  name: z.string(),

  old: z.object({
    name: z.string(),
  }),
  new: z.object({
    name: z.string(),
  }),
});

export type PlayerTeamChanged = z.infer<typeof PlayerTeamChangedSchema>;
