import {Module} from "@nestjs/common";
import {NotificationModule as CommonNotificationModule} from "@sprocketbot/common";

import {NotificationResolver} from "./notification.resolver";
import {NotificationService} from "./notification.service";

@Module({
    imports: [CommonNotificationModule],
    providers: [NotificationService, NotificationResolver],
})
export class NotificationModule {}
