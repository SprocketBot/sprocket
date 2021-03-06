import {z} from "zod";

export const RejectSubmission_Request = z.object({
    submissionId: z.string(),
    playerId: z.string(),
    reason: z.string(),
});

export const RejectSubmission_Response = z.literal(true);
