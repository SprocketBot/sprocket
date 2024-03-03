import {z} from "zod";

export const GetGameByGameMode_Request = z.object({
    gameModeId: z.number(),
});

export const GetGameByGameMode_Response = z.object({
    id: z.number(),
    title: z.string(),
});
