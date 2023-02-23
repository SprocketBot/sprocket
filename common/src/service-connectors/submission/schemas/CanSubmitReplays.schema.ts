import {z} from "zod";

export const CanSubmitReplays_Request = z.object({
    submissionId: z.string(),
    userId: z.number(),
});

export const CanSubmitReplays_Response = z.union([
    z.object({
        canSubmit: z.literal(false),
        reason: z.string(),
    }),
    z.object({
        canSubmit: z.literal(true),
    }),
]);
