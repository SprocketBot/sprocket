import {z} from "zod";

export const GetGameModeById_Request = z.object({
    gameModeId: z.number(),
});

export const GetGameModeById_Response = z.object({
    id: z.number(),
    description: z.string(),
});
