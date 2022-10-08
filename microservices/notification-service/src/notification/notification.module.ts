import {Module} from "@nestjs/common";
import {BotModule, RedisModule, UtilModule} from "@sprocketbot/common";

import {NotificationController} from "./notification.controller";
import {NotificationService} from "./notification.service";

@Module({
    imports: [RedisModule, BotModule, UtilModule],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
