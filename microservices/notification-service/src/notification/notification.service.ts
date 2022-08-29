import {Injectable} from "@nestjs/common";
import type {
    NotificationEndpoint, NotificationInput, NotificationOutput,
} from "@sprocketbot/common";
import {config, RedisService} from "@sprocketbot/common";
import {randomUUID} from "crypto";

@Injectable()
export class NotificationService {
    private readonly prefix = `${config.redis.prefix}:notification:`;

    constructor(private readonly redisService: RedisService) {}

    async sendNotification(data: NotificationInput<NotificationEndpoint.SendNotification>): Promise<NotificationOutput<NotificationEndpoint.SendNotification>> {
        const notificationId = randomUUID();

        await this.redisService.setJson(`${this.prefix}${data.payload.playerId}`, {
            id: notificationId,
        });

        return false;
    }
}
