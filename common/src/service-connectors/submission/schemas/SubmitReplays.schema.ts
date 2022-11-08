import {z} from "zod";

export const SubmitReplays_Request = z.object({
    filepaths: z.array(
        z.object({
            minioPath: z.string(),
            originalFilename: z.string(),
        }),
    ),
    submissionId: z.string(),
    creatorUserId: z.number(),
});
export const SubmitReplays_Response = z.array(z.string());
