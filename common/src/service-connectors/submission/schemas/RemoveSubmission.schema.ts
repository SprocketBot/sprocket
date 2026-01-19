import { z } from 'zod';

export const RemoveSubmission_Request = z.object({
  submissionId: z.string(),
});

export const RemoveSubmission_Response = z.object({
  removed: z.boolean(),
});
