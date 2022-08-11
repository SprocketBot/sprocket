import {z} from "zod";

export const GetMleMatchStakeholdersBySprocketMatchId_Request = z.object({
    matchId: z.number(),
});

export const GetMleMatchStakeholdersBySprocketMatchId_Response = z.object({
    discordIds: z.array(z.string()),
});
