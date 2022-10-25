import {z} from "zod";

import {FranchiseSchema} from "../types";

export const GetMatchById_Request = z.object({
    matchId: z.number(),
});

export const GetMatchById_Response = z.object({
    id: z.number(),
    homeFranchise: FranchiseSchema.optional(),
    awayFranchise: FranchiseSchema.optional(),
    skillGroupId: z.number().optional(),
    gameModeId: z.number(),
});
