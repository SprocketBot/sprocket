import {z} from "zod";

export const SubmissionStatsSchema = z.object({
    games: z.array(
        z.object({
            teams: z.array(
                z.object({
                    won: z.boolean(),
                    score: z.number(),
                    players: z.array(
                        z.object({
                            name: z.string(),
                            goals: z.number(),
                        }),
                    ),
                }),
            ),
        }),
    ),
});

export type SubmissionStats = z.infer<typeof SubmissionStatsSchema>;
