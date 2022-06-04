import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {AdministratorCommandsModule} from "./administrator-commands/administrator-commands.module";
import {DiscordModule} from "./discord/discord.module";
import {EmbedModule} from "./embed/embed.module";
import {EmbedService} from "./embed/embed.service";
import {GlobalModule} from "./global.module";
import {MarshalModule} from "./marshal";
import {MemberCommandsModule} from "./member-commands/member-commands.module";
import {NotificationsModule} from "./notifications/notifications.module";

@Module({
    imports: [
        GlobalModule,
        CoreModule,
        MarshalModule,
        MemberCommandsModule,
        AdministratorCommandsModule,
        DiscordModule,
        EmbedModule,
        NotificationsModule,
    ],
    providers: [
        GlobalModule,
        EmbedService,
    ],
})
export class AppModule {}
