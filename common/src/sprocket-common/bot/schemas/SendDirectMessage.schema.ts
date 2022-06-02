import {z} from "zod";

import {EmbedSchema} from "../types";

export const SendDirectMessage_Request = z.object({
    userId: z.string(),
    content: z.union([z.string(), EmbedSchema]),
});

export const SendDirectMessage_Response = z.boolean();
