import { z } from 'zod';

export const GetMleMatchInfoAndStakeholders_Request = z.object({
  sprocketMatchId: z.number(),
});

export const GetMleMatchInfoAndStakeholders_Response = z.object({
  organizationId: z.number(),
  stakeholderDiscordIds: z.array(z.string()),
  game: z.string(),
  gameMode: z.string(),
  skillGroup: z.string(),
});
