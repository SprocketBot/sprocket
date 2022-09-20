import {z} from "zod";

export const GetMatchInformationAndStakeholders_Request = z.object({
    matchId: z.number(),
});

const FranchiseWebhook = z.object({
    url: z.string().optional(),
    role: z.string().optional(),
});

export const GetMatchInformationAndStakeholders_Response = z.object({
    organizationId: z.number(),
    game: z.string(),
    gameMode: z.string(),
    skillGroup: z.string(),
    home: FranchiseWebhook,
    away: FranchiseWebhook,
});
