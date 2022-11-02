import {z} from "zod";

export const RatifySubmission_Request = z.object({
    submissionId: z.string(),
    userId: z.number(),
});

export const RatifySubmission_Response = z.literal(true);
