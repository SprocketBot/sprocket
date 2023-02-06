import {z} from "zod";

export const CanRatifySubmission_Request = z.object({
    submissionId: z.string(),
    userId: z.number(),
});

export const CanRatifySubmission_Response = z.union([
    z.object({
        canRatify: z.literal(false),
        reason: z.string(),
    }),
    z.object({
        canRatify: z.literal(true),
    }),
]);
