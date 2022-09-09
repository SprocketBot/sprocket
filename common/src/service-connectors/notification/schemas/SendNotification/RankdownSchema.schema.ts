import {z} from "zod";

import {
    BaseNotificationSchema, NotificationDirectMessageSchema, NotificationType,
} from "../SendNotification.schema";

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
