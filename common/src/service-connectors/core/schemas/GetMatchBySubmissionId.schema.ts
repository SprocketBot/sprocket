import { z } from 'zod';

import { FranchiseSchema } from '../types';

export const GetMatchBySubmissionId_Request = z.object({
  submissionId: z.string(),
});

export const GetMatchBySubmissionId_Response = z.object({
  id: z.number(),
  homeFranchise: FranchiseSchema.optional(),
  awayFranchise: FranchiseSchema.optional(),
  skillGroupId: z.number().optional(),
});
