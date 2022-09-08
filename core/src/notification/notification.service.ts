import {Injectable, Logger} from "@nestjs/common";
import {NotificationService as CommonNotificationService} from "@sprocketbot/common";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly commonNotificationService: CommonNotificationService) {}

    async getNotification(notificationId: string): Promise<void> {
        
    }
}
