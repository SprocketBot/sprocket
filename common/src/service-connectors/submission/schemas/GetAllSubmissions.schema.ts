import { z } from 'zod';

import { SubmissionSchema } from './Submission.schema';

export const GetAllSubmissions_Request = z.object({});

export const GetAllSubmissions_Response = z.array(SubmissionSchema);
export type GetAllSubmissionsResponse = z.infer<typeof GetAllSubmissions_Response>;
