import {z} from "zod";

export const CalculateSalaries_Input = z.object({
    doRankouts: z.boolean(),
});

export enum DegreeOfStiffness {
    SOFT = "SOFT",
    FIRM = "FIRM",
    HARD = "HARD",
}

export enum SkillGroupDelta {
    UP = "UP",
    DOWN = "DOWN",
}

export const RankoutSchema = z.object({
    skillGroupChange: z.nativeEnum(SkillGroupDelta),
    degreeOfStiffness: z.nativeEnum(DegreeOfStiffness),
    salary: z.number(),
});

export const SalaryPayloadItemSchema = z.object({
    playerId: z.number(),
    newSalary: z.number(),
    rankout: RankoutSchema.optional(),
});

export type SalaryPayloadItem = z.infer<typeof SalaryPayloadItemSchema>;

export const CalculateSalaries_Output = z.array(z.array(SalaryPayloadItemSchema));

