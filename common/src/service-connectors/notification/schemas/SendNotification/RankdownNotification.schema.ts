import {z} from "zod";

import {
    BaseNotificationSchema,
    NotificationDirectMessageSchema,
    NotificationType,
} from "./BaseNotification.schema";

export const RankdownNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal(NotificationType.RANKDOWN),
    expiration: z.preprocess(arg => {
        if (typeof arg === "string") {
            return new Date(arg);
        }
        return arg;
    }, z.date()),
    payload: z.object({
        playerId: z.number(),
        skillGroupId: z.number(),
        salary: z.number(),
    }),
    notification: NotificationDirectMessageSchema,
});

export type RankdownNotification = z.infer<typeof RankdownNotificationSchema>;
export type RankdownNotificationPayload = RankdownNotification["payload"];
