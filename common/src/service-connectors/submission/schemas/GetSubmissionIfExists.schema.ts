import {z} from "zod";

import {SubmissionSchema} from "./Submission.schema";

export const GetSubmissionIfExists_Request = z.string();

export const GetSubmissionIfExists_Response = z.object({
    submission: z.nullable(SubmissionSchema),
});
export type GetSubmissionIfExistsResponse = z.infer<typeof GetSubmissionIfExists_Response>;
