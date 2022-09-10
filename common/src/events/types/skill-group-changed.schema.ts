import {z} from "zod";

export const PlayerSkillGroup = z.object({
    id: z.number(),
    name: z.string(),
    salary: z.number(),
});

export const PlayerSkillGroupChanged = z.object({
    playerId: z.number(),
    name: z.string(),
    old: PlayerSkillGroup,
    new: PlayerSkillGroup,
});
