import { z } from 'zod';

import { FranchiseProfileSchema } from '../types';

export const GetFranchiseProfile_Request = z.object({ franchiseId: z.number() });

export const GetFranchiseProfile_Response = FranchiseProfileSchema;
