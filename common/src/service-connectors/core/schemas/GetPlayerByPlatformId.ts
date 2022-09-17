import {z} from "zod";

export const GetPlayerByPlatformId_Request = z.object({
    platform: z.string().transform(p => p.toUpperCase()),
    platformId: z.string(),
});

export const GetPlayerSchema = z.object({
    id: z.number(),
    discordId: z.string(),
    skillGroupId: z.number(),
    franchise: z.object({
        name: z.string(),
    }),
});

export type GetPlayer = z.infer<typeof GetPlayerSchema>;

const GetPlayerSuccessResponse = z.object({
    success: z.literal(true),
    data: z.object({
        
    }),
});

const GetPlayerErrorResponse = z.object({
    success: z.literal(false),
    error: z.string(),
});

export const GetPlayerByPlatformId_Response = z.union([GetPlayerSuccessResponse, GetPlayerErrorResponse]);

export type GetPlayerByPlatformIdResponse = z.infer<typeof GetPlayerByPlatformId_Response>;
