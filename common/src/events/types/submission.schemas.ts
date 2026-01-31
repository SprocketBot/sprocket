import {z} from "zod";

export const SubmissionEventSchema = z.object({submissionId: z.string(), redisKey: z.string()});
