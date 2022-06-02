import {z} from "zod";

export const SendGuildTextMessage_Request = z.object({
    channelId: z.string(),
    message: z.string(),
});

export const SendGuildTextMessage_Response = z.boolean();
