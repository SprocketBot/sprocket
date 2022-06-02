import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {BotEndpoint, BotSchemas} from "@sprocketbot/common";

import {NotificationsService} from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) {}
    
    @MessagePattern(BotEndpoint.SendMessageToGuildTextChannel)
    async sendMessageToGuildTextChannel(@Payload() payload: unknown): Promise<boolean> {
        const data = BotSchemas.SendMessageToGuildTextChannel.input.parse(payload);
        return this.notificationService.sendMessage(data.channelId, data.message);
    }
}
