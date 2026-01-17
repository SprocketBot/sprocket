import {z} from "zod";

export const GetGameByGameMode_Request = z.object({
    gameModeId: z.number(),
});

export const GetGameByGameMode_Response = z.object({
    id: z.number(),
    title: z.string(),
    mode: z.object({
        id: z.number(),
        description: z.string(),
        teamCount: z.number(),
        teamSize: z.number(),
    }).optional(),
});

export type GetGameByGameModeResponse = z.infer<typeof GetGameByGameMode_Response>;
