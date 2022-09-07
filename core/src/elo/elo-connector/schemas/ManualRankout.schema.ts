import {z} from "zod";

import {SkillGroup} from "./AddPlayers.schema";

export const ManualSkillGroupChangeSchema = z.object({
    id: z.number(),
    skillGroup: z.nativeEnum(SkillGroup),
    salary: z.number(),
});

export type ManualSkillGroupChange = z.infer<typeof ManualSkillGroupChangeSchema>;

export const SGChange_Input = ManualSkillGroupChangeSchema;
export const SGChange_Output = z.object({});
