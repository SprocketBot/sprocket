import {z} from "zod";

import {MessageContentSchema} from "../types";

export const SendGuildTextMessage_Request = z.object({
    channelId: z.string(),
    content: z.union([z.string(), MessageContentSchema]),
});

export const SendGuildTextMessage_Response = z.boolean();
