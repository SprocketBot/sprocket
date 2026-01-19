import { z } from 'zod';

export const GetMatchReportCardWebhooks_Request = z.object({
  matchId: z.number(),
});

export const GetMatchReportCardWebhooks_Response = z.object({
  organizationId: z.number(),
  skillGroupWebhook: z.string().nullable().optional(),
  franchiseWebhooks: z.array(z.string()),
});
