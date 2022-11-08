import {z} from "zod";

import {ScrimSchema} from "../../types";

export const GetScrimBySubmissionId_Request = z.object({
    submissionId: z.string(),
});

export const GetScrimBySubmissionId_Response = ScrimSchema.nullable();
