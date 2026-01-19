import { z } from 'zod';

export const CanRatifySubmission_Request = z.object({
  submissionId: z.string(),
  memberId: z.number(),
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
export type CanRatifySubmissionResponse = z.infer<typeof CanRatifySubmission_Response>;
