import {Module} from "@nestjs/common";
import {CoreModule, EventsModule} from "@sprocketbot/common";

import {DiscordModule} from "../discord/discord.module";
import {SprocketEventsService} from "./sprocket-events.service";

@Module({
    imports: [
        DiscordModule,
        CoreModule,
        EventsModule,
    ],
    providers: [SprocketEventsService],
})
export class SprocketEventsModule {}
