import {z} from "zod";

export const GetPlayerFranchises_Request = z.object({
    memberId: z.number(),
});
export const GetPlayerFranchises_Response = z.array(z.object({
    id: z.number(),
    name: z.string(),
    staffPositions: z.array(z.object({
        id: z.number(),
        name: z.string(),
    })),
}));
