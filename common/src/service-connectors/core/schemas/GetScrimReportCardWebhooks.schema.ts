import { z } from 'zod';

import { ScrimSchema } from '../../matchmaking';

export const GetScrimReportCardWebhooks_Request = ScrimSchema;

export const GetScrimReportCardWebhooks_Response = z.object({
  skillGroupWebhook: z.string().nullable().optional(),
  franchiseWebhooks: z.array(z.string()),
});
