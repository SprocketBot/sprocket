import {z} from "zod";

import {ProgressMessageSchema} from "../../../celery";

export const SubmissionItemSchema = z.object({
    taskId: z.string(),
    originalFilename: z.string(),
    inputPath: z.string(),
    outputPath: z.string().optional(),
    progress: ProgressMessageSchema.extend({
        result: z.any().optional(),
    }),
});

export type SubmissionItem = z.infer<typeof SubmissionItemSchema>;
