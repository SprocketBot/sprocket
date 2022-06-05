import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {BotEndpoint, BotSchemas} from "@sprocketbot/common";

import {NotificationsService} from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) {}
    
    @MessagePattern(BotEndpoint.SendGuildTextMessage)
    async sendGuildTextMessage(@Payload() payload: unknown): Promise<boolean> {
        const data = BotSchemas.SendGuildTextMessage.input.parse(payload);
        return this.notificationService.sendGuildTextMessage(data.channelId, data.content, data.brandingOptions);
    }
    
    @MessagePattern(BotEndpoint.SendDirectMessage)
    async sendDirectMessage(@Payload() payload: unknown): Promise<boolean> {
        const data = BotSchemas.SendDirectMessage.input.parse(payload);
        return this.notificationService.sendDirectMessage(data.userId, data.content, data.brandingOptions);
    }
}
