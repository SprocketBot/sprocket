import {z} from "zod";

export const PlayerSkillGroup = z.object({
    id: z.number(),
    name: z.string(),
    salary: z.number(),
    discordEmojiID: z.string(),
});

export const PlayerSkillGroupChanged = z.object({
    playerId: z.number(),
    name: z.string(),
    organizationId: z.number(),
    old: PlayerSkillGroup,
    new: PlayerSkillGroup,
});

export type PlayerSkillGroupChangedType = z.infer<typeof PlayerSkillGroupChanged>;
