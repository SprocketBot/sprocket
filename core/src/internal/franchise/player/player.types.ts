import {z} from "zod";

export interface GameAndOrganization {
    gameId: number;
    organizationId: number;
}

export const RankdownJwtPayloadSchema = z.object({
    playerId: z.number(),
    salary: z.number(),
    skillGroupId: z.number(),
});

export type RankdownJwtPayload = z.infer<typeof RankdownJwtPayloadSchema>;
