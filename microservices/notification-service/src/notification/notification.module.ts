import {Module} from "@nestjs/common";
import {RedisModule} from "@sprocketbot/common";

import {NotificationController} from "./notification.controller";
import {NotificationService} from "./notification.service";

@Module({
    imports: [RedisModule],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
