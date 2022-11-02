import {z} from "zod";

export const ResetSubmission_Request = z.object({
    submissionId: z.string(),
    override: z.boolean().default(false),
    userId: z.number(),
});

export const ResetSubmission_Response = z.literal(true);
