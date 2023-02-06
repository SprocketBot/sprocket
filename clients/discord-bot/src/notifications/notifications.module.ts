import {Module} from "@nestjs/common";
import {CoreModule, S3Module} from "@sprocketbot/common";

import {DiscordModule} from "../discord/discord.module";
import {EmbedModule} from "../embed";
import {NotificationsController} from "./notifications.controller";
import {NotificationsService} from "./notifications.service";

@Module({
    imports: [
        DiscordModule,
        EmbedModule,
        S3Module,
        CoreModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
