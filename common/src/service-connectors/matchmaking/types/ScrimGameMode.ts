import {z} from "zod";

export const ScrimGameModeSchema = z.object({
    id: z.number(),
    description: z.string(),
});

export type ScrimGameMode = z.infer<typeof ScrimGameModeSchema>;
