import {Module} from "@nestjs/common";

import {DiscordModule} from "../discord/discord.module";
import {EmbedModule} from "../embed";
import {NotificationsController} from "./notifications.controller";
import {NotificationsService} from "./notifications.service";

@Module({
    imports: [DiscordModule, EmbedModule],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule {}
