import {z} from "zod";

import {BrandingOptionsSchema, MessageContentSchema, WebhookMessageOptionsSchema} from "../types";

export const SendWebhookMessage_Request = z.object({
    webhookUrl: z.string().regex(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/),
    payload: MessageContentSchema.merge(WebhookMessageOptionsSchema),
    brandingOptions: BrandingOptionsSchema.optional(),
});

export const SendWebhookMessage_Response = z.boolean();
