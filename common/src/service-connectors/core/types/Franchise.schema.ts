import * as z from "zod";

export const FranchiseProfileSchema = z.object({
    title: z.string(),
    code: z.string(),
    scrimReportWebhookUrl: z.string().nullable().optional(),
    matchReportWebhookUrl: z.string().nullable().optional(),
});

export const FranchiseSchema = z.object({
    id: z.number(),
    // Used to relate to MLE Franchises
    name: z.string(),
});

export type FranchiseProfile = z.infer<typeof FranchiseProfileSchema>;
export type Franchise = z.infer<typeof FranchiseSchema>;
