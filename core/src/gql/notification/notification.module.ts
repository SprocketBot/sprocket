import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import { NotificationTemplateRepository } from '../../db/notification/notification_template.repository';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceEntity } from '../../db/notification/user_notification_preference.entity';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationTemplateService } from './notification-template.service';
import { DiscordNotificationService } from './discord-notification.service';
import { WebhookNotificationService } from './webhook-notification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationTemplateEntity,
            NotificationHistoryEntity,
            UserNotificationPreferenceEntity,
        ]),
    ],
    providers: [
        NotificationTemplateService,
        DiscordNotificationService,
        WebhookNotificationService,
        NotificationTemplateRepository,
        NotificationHistoryRepository,
        UserNotificationPreferenceRepository,
    ],
    exports: [
        NotificationTemplateService,
        DiscordNotificationService,
        WebhookNotificationService,
        NotificationTemplateRepository,
        NotificationHistoryRepository,
        UserNotificationPreferenceRepository,
    ],
})
export class NotificationModule { }