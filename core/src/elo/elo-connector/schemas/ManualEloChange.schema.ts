import {z} from "zod";

export const ManualEloChangeSchema = z.object({
    id: z.number(),
    salary: z.number(),
    elo: z.number(),
});

export type ManualEloChange = z.infer<typeof ManualEloChangeSchema>;

export const EloChange_Input = ManualEloChangeSchema;
export const EloChange_Output = z.object({});
