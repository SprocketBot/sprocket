import {z} from "zod";

import {EmbedSchema} from "./Embed";

export const MessageContentSchema = z.object({
    content: z.string().optional(),
    embeds: z.array(EmbedSchema).max(1)
        .optional(),
});

export type MessageContent = z.infer<typeof MessageContentSchema>;
