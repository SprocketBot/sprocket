import { z } from 'zod';

import {
  SendDirectMessage_Request,
  SendGuildTextMessage_Request,
  SendWebhookMessage_Request,
} from '../../../bot/schemas';

export enum NotificationType {
  BASIC = 'BASIC',
  RANKDOWN = 'RANKDOWN',
}

export enum NotificationMessageType {
  GuildTextMessage = 'GuildTextMessage',
  DirectMessage = 'DirectMessage',
  WebhookMessage = 'WebhookMessage',
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
  id: z.string().nullable().optional(),
  type: z.nativeEnum(NotificationType),
  userId: z.number(),
  expiration: z
    .preprocess(arg => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    }, z.date())
    .nullable()
    .optional(),
  payload: z.undefined(),
  notification: z.union([
    NotificationGuildTextMessageSchema,
    NotificationDirectMessageSchema,
    NotificationWebhookMessageSchema,
  ]),
});
