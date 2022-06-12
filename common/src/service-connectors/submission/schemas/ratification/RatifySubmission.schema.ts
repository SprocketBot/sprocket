import {z} from "zod";

export const RatifySubmission_Request = z.object({
    submissionId: z.string(),
    playerId: z.string(),
});

export const RatifySubmission_Response = z.void();
