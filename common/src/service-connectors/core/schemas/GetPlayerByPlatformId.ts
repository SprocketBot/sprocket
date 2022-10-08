import {z} from "zod";

export const GetPlayerByPlatformId_Request = z.object({
    platform: z.string().transform(p => p.toUpperCase()),
    platformId: z.string(),
    gameId: z.number(),
});

export const GetPlayerSchema = z.object({
    id: z.number(),
    userId: z.number(),
    skillGroupId: z.number(),
    franchise: z.object({
        name: z.string(),
    }),
});

export type GetPlayer = z.infer<typeof GetPlayerSchema>;

export const GetPlayerSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: GetPlayerSchema,
    request: GetPlayerByPlatformId_Request,
});

export type GetPlayerSuccessResponse = z.infer<typeof GetPlayerSuccessResponseSchema>;

export const GetPlayerErrorResponseSchema = z.object({
    success: z.literal(false),
    request: GetPlayerByPlatformId_Request,
});

export const GetPlayerByPlatformId_Response = z.union([GetPlayerSuccessResponseSchema, GetPlayerErrorResponseSchema]);

export type GetPlayerByPlatformIdResponse = z.infer<
    typeof GetPlayerByPlatformId_Response
>;
