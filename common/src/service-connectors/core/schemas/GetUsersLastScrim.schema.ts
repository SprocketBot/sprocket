import { z } from 'zod';

import { OrganizationSchema } from '../types';

export const GetUsersLastScrim_Request = z.object({
  userId: z.number(),
  organizationId: z.number(),
});

export const GetUsersLastScrim_Response = OrganizationSchema;

export type GetUsersLastScrimResponse = z.infer<typeof GetUsersLastScrim_Response>;
