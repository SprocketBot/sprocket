import {z} from "zod";

import {MessageContentSchema} from "../types";

export const SendGuildTextMessage_Request = z.object({
    organizationId: z.number(),
    channelId: z.string(),
    content: MessageContentSchema,
});

export const SendGuildTextMessage_Response = z.boolean();
