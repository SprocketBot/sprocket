import {z} from "zod";

export const ValidateSubmission_Request = z.object({
    submissionId: z.string(),
});

const ValidateSubmissionSuccess_Response = z.object({
    valid: z.literal(true),
});

const ValidateSubmissionError_Response = z.object({
    valid: z.literal(false),
    errors: z.array(
        z.object({
            error: z.string(),
            gameIndex: z.optional(z.number()),
            teamIndex: z.optional(z.number()),
            playerIndex: z.optional(z.number()),
        }),
    ),
});

export const ValidateSubmission_Response = z.union([
    ValidateSubmissionSuccess_Response,
    ValidateSubmissionError_Response,
]);
