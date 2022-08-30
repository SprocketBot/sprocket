import {z} from "zod";

import {
    SendDirectMessage_Request,
    SendGuildTextMessage_Request,
    SendWebhookMessage_Request,
} from "../../bot";

export enum NotificationType {
    RANKDOWN = "RANKDOWN",
    TEST = "TEST",
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
    ]).nullable()
        .optional(),
});

export const RankdownNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal(NotificationType.RANKDOWN),
    expiration: z.date(),
    payload: z.object({
        playerId: z.number(),
        skillGroupId: z.number(),
        salary: z.number(),
    }),
    notification: NotificationDirectMessageSchema,
});

export type RankdownNotification = z.infer<typeof RankdownNotificationSchema>;
export type RankdownNotificationPayload = RankdownNotification["payload"];

export const TestNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal(NotificationType.TEST),
    expiration: z.date(),
});

export const NotificationSchema = z.union([RankdownNotificationSchema, TestNotificationSchema]);

export const SendNotification_Request = NotificationSchema;

export const SendNotification_Response = z.boolean();
