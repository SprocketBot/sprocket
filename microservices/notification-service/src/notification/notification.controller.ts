import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {NotificationOutput} from "@sprocketbot/common";
import {NotificationEndpoint, NotificationSchemas} from "@sprocketbot/common";

import {NotificationService} from "./notification.service";

@Controller("notification")
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @MessagePattern(NotificationEndpoint.SendNotification)
    async sendNotification(
        @Payload() payload: unknown,
    ): Promise<NotificationOutput<NotificationEndpoint.SendNotification>> {
        const data = NotificationSchemas.SendNotification.input.parse(payload);
        return this.notificationService.sendNotification(data);
    }
}
