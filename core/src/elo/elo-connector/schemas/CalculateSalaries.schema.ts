import {z} from "zod";

export const CalculateSalaries_Input = z.object({
    doRankouts: z.boolean(),
});

export enum DegreeOfStiffness {
    SOFT = "SOFT",
    HARD = "HARD",
}

export const SalaryPayloadItemSchema = z.object({
    playerId: z.number(),
    newSalary: z.number(),
    sgDelta: z.number(),
    degreeOfStiffness: z.nativeEnum(DegreeOfStiffness),
});

export type SalaryPayloadItem = z.infer<typeof SalaryPayloadItemSchema>;

export const CalculateSalaries_Output = z.array(z.array(SalaryPayloadItemSchema));

