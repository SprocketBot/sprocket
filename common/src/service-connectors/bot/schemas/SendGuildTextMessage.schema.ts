import { z } from 'zod';

import { BrandingOptionsSchema, MessageContentSchema } from '../types';

export const SendGuildTextMessage_Request = z.object({
  channelId: z.string(),
  payload: MessageContentSchema,
  brandingOptions: BrandingOptionsSchema.optional(),
});

export const SendGuildTextMessage_Response = z.boolean();
