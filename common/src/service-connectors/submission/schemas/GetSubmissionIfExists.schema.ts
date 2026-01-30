import { z } from 'zod';

import { CompatibleSubmissionSchema } from './EnhancedSubmission.schema';

export const GetSubmissionIfExists_Request = z.string();

export const GetSubmissionIfExists_Response = z.object({
  submission: z.nullable(CompatibleSubmissionSchema),
});
export type GetSubmissionIfExistsResponse = z.infer<typeof GetSubmissionIfExists_Response>;
