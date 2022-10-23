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

export const EloRedistributionSchema = z.array(z.tuple([
    z.string(),
    z.string(),
    z.string(),
]).rest(z.string())
    .transform(([playerId, salary, newElo]) => ({
        playerId: parseInt(playerId),
        salary: parseFloat(salary),
        newElo: parseFloat(newElo),
    })));

export type RankdownJwtPayload = z.infer<typeof RankdownJwtPayloadSchema>;
