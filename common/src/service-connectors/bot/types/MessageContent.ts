import { z } from 'zod';

import { AttachmentSchema } from './Attachment';
import { ActionRowComponentSchema } from './Component';
import { EmbedSchema } from './Embed';

export const MessageContentSchema = z.object({
  content: z.string().optional(),
  embeds: z.array(EmbedSchema).max(1).optional(),
  components: z.array(ActionRowComponentSchema).optional(),
  attachments: z.array(z.union([z.string(), AttachmentSchema])).optional(),
});

export type MessageContent = z.infer<typeof MessageContentSchema>;
