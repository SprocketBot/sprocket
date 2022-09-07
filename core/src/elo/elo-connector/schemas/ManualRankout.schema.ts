import {z} from "zod";

import {SkillGroups} from "../../elo/elo.types";

export const ManualSkillGroupChangeSchema = z.object({
    id: z.number(),
    name: z.string(),
    skillGroup: z.nativeEnum(SkillGroups),
    salary: z.number(),
});

export type ManualSkillGroupChange = z.infer<typeof ManualSkillGroupChangeSchema>;

export const SGChange_Input = ManualSkillGroupChangeSchema;
export const SGChange_Output = z.object({});
