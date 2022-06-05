import {z} from "zod";

import {BrandingOptionsSchema, MessageContentSchema} from "../types";

export const SendDirectMessage_Request = z.object({
    userId: z.string(),
    content: MessageContentSchema,
    brandingOptions: BrandingOptionsSchema.optional(),
});

export const SendDirectMessage_Response = z.boolean();
