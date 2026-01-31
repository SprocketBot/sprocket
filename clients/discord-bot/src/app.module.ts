import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {CommandsModule} from "./commands/commands.module";
import {DiscordModule} from "./discord/discord.module";
import {EmbedModule} from "./embed/embed.module";
import {EmbedService} from "./embed/embed.service";
import {EventsModule} from "./events/events.module";
import {GlobalModule} from "./global.module";
import {MarshalModule} from "./marshal";
import {NotificationsModule} from "./notifications";
import {SprocketEventsModule} from "./sprocket-events/sprocket-events.module";

@Module({
    imports: [
        GlobalModule,
        CoreModule,
        MarshalModule,
        DiscordModule,
        EmbedModule,
        NotificationsModule,
        EventsModule,
        CommandsModule,
        SprocketEventsModule,
    ],
    providers: [GlobalModule, EmbedService],
})
export class AppModule {}
