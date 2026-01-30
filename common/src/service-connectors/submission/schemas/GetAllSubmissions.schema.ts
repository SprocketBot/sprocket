import { z } from 'zod';

import { EnhancedSubmissionSchema } from './EnhancedSubmission.schema';

export const GetAllSubmissions_Request = z.object({});

export const GetAllSubmissions_Response = z.array(EnhancedSubmissionSchema);
export type GetAllSubmissionsResponse = z.infer<typeof GetAllSubmissions_Response>;
