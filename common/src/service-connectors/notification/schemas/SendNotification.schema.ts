import {z} from "zod";

import {
    SendDirectMessage_Request,
    SendGuildTextMessage_Request,
    SendWebhookMessage_Request,
} from "../../bot";
import {RankdownNotificationSchema} from "./SendNotification";

export enum NotificationType {
    RANKDOWN = "RANKDOWN",
}

export enum NotificationMessageType {
    GuildTextMessage = "GuildTextMessage",
    DirectMessage = "DirectMessage",
    WebhookMessage = "WebhookMessage",
}

export const NotificationGuildTextMessageSchema = SendGuildTextMessage_Request.extend({
    type: z.literal(NotificationMessageType.GuildTextMessage),
});

export const NotificationDirectMessageSchema = SendDirectMessage_Request.extend({
    type: z.literal(NotificationMessageType.DirectMessage),
});

export const NotificationWebhookMessageSchema = SendWebhookMessage_Request.extend({
    type: z.literal(NotificationMessageType.WebhookMessage),
});

export const BaseNotificationSchema = z.object({
    id: z.string().uuid()
        .nullable()
        .optional(),
    type: z.nativeEnum(NotificationType),
    userId: z.number(),
    expiration: z.date().nullable()
        .optional(),
    payload: z.object({}).nullable()
        .optional(),
    notification: z.union([
        NotificationGuildTextMessageSchema,
        NotificationDirectMessageSchema,
        NotificationWebhookMessageSchema,
    ]),
});

export const NotificationSchema = z.union([BaseNotificationSchema, RankdownNotificationSchema]);

export const SendNotification_Request = NotificationSchema;

export const SendNotification_Response = z.boolean();
