import {z} from "zod";

export const GetPlayerByPlatformId_Request = z.object({
    platform: z.string().transform(p => p.toUpperCase()),
    platformId: z.string(),
});

export const GetPlayerByPlatformId_Response = z.object({
    id: z.number(),
    discordId: z.string(),
    skillGroupId: z.number(),
    franchise: z.object({
        name: z.string(),
    }),
});

export type GetPlayerByPlatformIdResponse = z.infer<typeof GetPlayerByPlatformId_Response>;
