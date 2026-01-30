import { z } from 'zod';

import { EnhancedSubmissionSchema } from './EnhancedSubmission.schema';

export const GetSubmissionIfExists_Request = z.string();

export const GetSubmissionIfExists_Response = z.object({
  submission: z.nullable(EnhancedSubmissionSchema),
});
export type GetSubmissionIfExistsResponse = z.infer<typeof GetSubmissionIfExists_Response>;
