import { z } from 'zod';

export const GetGuildsByOrganizationId_Request = z.object({
  organizationId: z.number(),
});

export const GetGuildsByOrganizationId_Response = z.object({
  primary: z.string().nullable(),
  alternates: z.array(z.string()),
});

export type GetGuildsByOrganizationIdResponse = z.infer<typeof GetGuildsByOrganizationId_Response>;
