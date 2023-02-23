import {z} from "zod";

import {SubmissionSchema} from "../types";

export const GetSubmissionIfExists_Request = z.string();

export const GetSubmissionIfExists_Response = z.object({
    submission: z.nullable(SubmissionSchema),
});
