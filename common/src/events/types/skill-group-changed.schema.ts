import { z } from 'zod';

export const PlayerSkillGroup = z.object({
  id: z.number(),
  name: z.string(),
  salary: z.number(),
  discordEmojiId: z.string(),
});

export const PlayerSkillGroupChanged = z.object({
  playerId: z.number(),
  name: z.string(),
  organizationId: z.number(),
  discordId: z.string(),
  old: PlayerSkillGroup,
  new: PlayerSkillGroup,
});

export type PlayerSkillGroupChangedType = z.infer<typeof PlayerSkillGroupChanged>;
