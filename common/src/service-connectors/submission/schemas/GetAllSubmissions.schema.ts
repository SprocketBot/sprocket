import {z} from "zod";

import {CompatibleSubmissionSchema} from "./EnhancedSubmission.schema";

export const GetAllSubmissions_Request = z.object({});

export const GetAllSubmissions_Response = z.array(CompatibleSubmissionSchema);
export type GetAllSubmissionsResponse = z.infer<typeof GetAllSubmissions_Response>;
