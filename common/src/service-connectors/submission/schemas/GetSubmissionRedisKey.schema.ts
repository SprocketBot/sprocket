import { z } from 'zod';

export const GetSubmissionRedisKey_Request = z.object({
  submissionId: z.string(),
});

export const GetSubmissionRedisKey_Response = z.object({
  redisKey: z.string(),
});
