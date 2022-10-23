import {z} from "zod";

export const GetUserByAuthAccount_Request = z.object({
    accountId: z.string(),
    accountType: z.enum(["DISCORD", "GOOGLE"]),
});

export const GetUserByAuthAccount_Response = z.object({
    id: z.number(),
    profile: z.object({
        email: z.string(),
        displayName: z.string(),
        firstName: z.string().optional().nullable(),
        lastName: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
    }),
});

export type GetUserByAuthAccountResponse = z.infer<typeof GetUserByAuthAccount_Response>;
