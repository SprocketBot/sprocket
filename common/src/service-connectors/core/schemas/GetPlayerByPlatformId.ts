import {z} from "zod";

export const GetPlayerByPlatformId_Request = z.object({
    platform: z.string(),
    platformId: z.string(),
});

export const GetPlayerByPlatformId_Response = z.object({
    id: z.number(),
    discordId: z.string(),
    skillGroupId: z.number(),
});

export type GetPlayerByPlatformIdResponse = z.infer<typeof GetPlayerByPlatformId_Response>;
