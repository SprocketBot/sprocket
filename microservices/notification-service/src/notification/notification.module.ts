import {Module} from "@nestjs/common";
import {BotModule, RedisModule} from "@sprocketbot/common";

import {NotificationController} from "./notification.controller";
import {NotificationService} from "./notification.service";

@Module({
    imports: [RedisModule, BotModule],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
