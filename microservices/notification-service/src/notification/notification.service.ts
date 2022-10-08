import {Injectable, Logger} from "@nestjs/common";
import type {
    NotificationEndpoint,
    NotificationInput,
    NotificationOutput,
} from "@sprocketbot/common";
import {
    BotEndpoint,
    BotService,
    config,
    NanoidService,
    NotificationMessageType,
    RedisService,
} from "@sprocketbot/common";
@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    private readonly prefix = `${config.redis.prefix}:notification:`;

    constructor(
        private readonly redisService: RedisService,
        private readonly botService: BotService,
        private readonly nanoidService: NanoidService,
    ) {}

    async sendNotification(
        data: NotificationInput<NotificationEndpoint.SendNotification>,
    ): Promise<NotificationOutput<NotificationEndpoint.SendNotification>> {
        if (data.payload) {
            const notificationPayload = {
                id:
                    data.id ??
                    `${data.type.toLowerCase()}-${this.nanoidService.gen()}`,
                type: data.type,
                userId: data.userId,
                expiration: data.expiration,
                ...data.payload,
            };

            // TODO: TTL 14 days
            await this.redisService.setJson(
                `${this.prefix}${data.userId}:${data.type}:${notificationPayload.id}`,
                notificationPayload,
            );
        }

        if (
            data.notification.type === NotificationMessageType.GuildTextMessage
        ) {
            await this.botService.send(
                BotEndpoint.SendGuildTextMessage,
                data.notification,
            );
        } else if (
            data.notification.type === NotificationMessageType.DirectMessage
        ) {
            await this.botService.send(
                BotEndpoint.SendDirectMessage,
                data.notification,
            );
        } else {
            await this.botService.send(
                BotEndpoint.SendWebhookMessage,
                data.notification,
            );
        }

        return true;
    }
}
