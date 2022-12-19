import {z} from "zod";

export const RankdownJwtPayloadSchema = z.object({
    playerId: z.number(),
    salary: z.number(),
    skillGroupId: z.number(),
});

export type RankdownJwtPayload = z.infer<typeof RankdownJwtPayloadSchema>;
