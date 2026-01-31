import {z} from "zod";

export const WebhookMessageOptionsSchema = z.object({
    username: z.string().optional(),
    avatarURL: z.string().optional(),
});

export type WebhookMessageOptions = z.infer<typeof WebhookMessageOptionsSchema>;
