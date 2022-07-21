import {z} from "zod";

export const GetFranchiseStaff_Request = z.object({franchiseId: z.number()});

export const GetFranchiseStaff_Response = z.array(z.object({
    id: z.number(),
    role: z.string(),
}));
