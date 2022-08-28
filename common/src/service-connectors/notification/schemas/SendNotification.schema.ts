import {z} from "zod";

import {
    SendDirectMessage_Request,
    SendGuildTextMessage_Request,
    SendWebhookMessage_Request,
} from "../../bot";

export enum NotificationType {
    RANKDOWN = "RANKDOWN",
}

export const BaseNotificationSchema = z.object({
    type: z.nativeEnum(NotificationType),
    expiration: z.date().nullable()
        .optional(),
    payload: z.object({}),
    notification: z.union([SendDirectMessage_Request, SendWebhookMessage_Request, SendGuildTextMessage_Request]),
});

export const RankdownNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal(NotificationType.RANKDOWN),
    expiration: z.date(),
    payload: z.object({
        playerId: z.number(),
        skillGroupId: z.number(),
        salary: z.number(),
    }),
    notification: SendDirectMessage_Request,
});

export type RankdownNotification = z.infer<typeof RankdownNotificationSchema>;
export type RankdownNotificationPayload = RankdownNotification["payload"];

// TODO: Union once we get another notification type
export const NotificationSchema = /* z.union([ */RankdownNotificationSchema/* ]) */;

export const SendNotification_Request = NotificationSchema;

export const SendNotification_Response = z.boolean();
