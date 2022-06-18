import {z} from "zod";

export const GetSubmissionRejections_Request = z.object({
    submissionId: z.string(),
});

export const GetSubmissionRejections_Response = z.array(z.string());

export type IGetSubmissionRejections_Response = z.infer<typeof GetSubmissionRejections_Response>;
