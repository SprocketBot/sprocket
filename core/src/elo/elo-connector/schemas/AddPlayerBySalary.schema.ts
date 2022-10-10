import {z} from "zod";

import {SkillGroup} from "./AddPlayers.schema";

export const NewPlayerBySalarySchema = z.object({
    id: z.number(),
    name: z.string(),
    salary: z.number().min(5).max(20).multipleOf(0.5),
    skillGroup: z.nativeEnum(SkillGroup),
});

export type NewPlayerBySalary = z.infer<typeof NewPlayerBySalarySchema>;

export const AddPlayerBySalary_Input = NewPlayerBySalarySchema;

export const AddPlayerBySalary_Output = z.object({});
