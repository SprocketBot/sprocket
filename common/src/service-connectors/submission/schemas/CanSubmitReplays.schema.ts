import {z} from "zod";

export const CanSubmitReplays_Request = z.object({
    submissionId: z.string(),
    playerId: z.number(),
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
export type ICanSubmitReplays_Response = z.infer<typeof CanSubmitReplays_Response>;
