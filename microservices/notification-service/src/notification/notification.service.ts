import {Injectable} from "@nestjs/common";
import type {
    NotificationEndpoint, NotificationInput, NotificationOutput,
} from "@sprocketbot/common";
import {
    BotEndpoint,
} from "@sprocketbot/common";
import {
    BotService, config, RedisService,
} from "@sprocketbot/common";
import {NotificationMessageType} from "@sprocketbot/common/lib/service-connectors/notification/schemas";
import {randomUUID} from "crypto";

@Injectable()
export class NotificationService {
    private readonly prefix = `${config.redis.prefix}:notification:`;

    constructor(
        private readonly redisService: RedisService,
        private readonly botService: BotService,
    ) {}

    async sendNotification(data: NotificationInput<NotificationEndpoint.SendNotification>): Promise<NotificationOutput<NotificationEndpoint.SendNotification>> {
        const notificationPayload = {
            id: randomUUID(),
            type: data.type,
            expiration: data.expiration,
            ...data.payload,
        };

        // TODO: TTL 14 days
        await this.redisService.setJson(`${this.prefix}${data.payload.playerId}:${data.type}:${notificationPayload.id}`, notificationPayload);
        
        if (data.notification?.type === NotificationMessageType.GuildTextMessage) {
            await this.botService.send(BotEndpoint.SendGuildTextMessage, data.notification);
        } else if (data.notification?.type === NotificationMessageType.DirectMessage) {
            await this.botService.send(BotEndpoint.SendDirectMessage, data.notification);
        } else if (data.notification?.type === NotificationMessageType.WebhookMessage) {
            await this.botService.send(BotEndpoint.SendWebhookMessage, data.notification);
        }

        return false;
    }
}
