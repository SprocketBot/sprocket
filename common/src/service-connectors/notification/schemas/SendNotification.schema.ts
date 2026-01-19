import { z } from 'zod';

import { BaseNotificationSchema, RankdownNotificationSchema } from './SendNotification';

export const NotificationSchema = z.union([BaseNotificationSchema, RankdownNotificationSchema]);

export const SendNotification_Request = NotificationSchema;

export const SendNotification_Response = z.boolean();
