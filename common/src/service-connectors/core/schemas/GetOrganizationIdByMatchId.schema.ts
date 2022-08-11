import {z} from "zod";

export const GetOrganizationIdByMatchId_Request = z.object({
    matchId: z.number(),
});

export const GetOrganizationIdByMatchId_Response = z.object({
    organizationId: z.number(),
});
