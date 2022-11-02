import {z} from "zod";

export enum JwtType {
    Authentication = "Authentication",
    Refresh = "Refresh",
}

export const JwtBasePayloadSchema = z.object({
    sub: z.number(),
    type: z.nativeEnum(JwtType),
    userId: z.number(),
    currentOrganizationId: z.number().optional(),
});

export const JwtAuthPayloadSchema = JwtBasePayloadSchema.extend({
    type: z.literal(JwtType.Authentication),
    username: z.string(),
    orgTeams: z.array(z.number()),
});

export const JwtRefreshPayloadSchema = JwtBasePayloadSchema.extend({
    type: z.literal(JwtType.Refresh),
});

export const JwtPayloadSchema = z.union([JwtAuthPayloadSchema, JwtRefreshPayloadSchema]);

export type JwtAuthPayload = z.infer<typeof JwtAuthPayloadSchema>;
export type JwtRefreshPayload = z.infer<typeof JwtRefreshPayloadSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
