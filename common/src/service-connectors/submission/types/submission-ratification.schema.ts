import {z} from "zod";

import {DateSchema} from "../../../types";
import {SubmissionItemSchema} from "./submission-item.schema";

export const SubmissionRatificationSchema = z.object({
    userId: z.number(),
    ratifiedAt: DateSchema,
});

export const SubmissionRejectionSchema = z.object({
    userId: z.number(),
    rejectedAt: DateSchema,
    reason: z.string(),
});

export const SubmissionRatificationRoundSchema = z.object({
    uploaderUserId: z.number(),
    items: z.array(SubmissionItemSchema.omit({progress: true})),
    ratifications: z.array(SubmissionRatificationSchema),
    rejections: z.array(SubmissionRejectionSchema),
});

export type SubmissionRatification = z.infer<typeof SubmissionRatificationSchema>;
export type SubmissionRejection = z.infer<typeof SubmissionRejectionSchema>;
export type SubmissionRatificationRound = z.infer<typeof SubmissionRatificationRoundSchema>;
