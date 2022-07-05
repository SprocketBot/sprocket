import {z} from "zod";

export const GetUserByDiscordId_Request = z.object({
    discordId: z.string(),
});

export const GetUserByDiscordId_Response = z.object({
    id: z.number(),
});

export type GetUserByDiscordIdResponse = z.infer<typeof GetUserByDiscordId_Response>;
