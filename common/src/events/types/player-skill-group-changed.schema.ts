import {z} from "zod";

export const SkillGroupSchema = z.object({
    id: z.number(),
    ordinal: z.number(),
    name: z.string(),
});

export const PlayerSkillGroupChangedSchema = z.object({
    oldSkillGroup: SkillGroupSchema,
    newSkillGroup: SkillGroupSchema,
});
