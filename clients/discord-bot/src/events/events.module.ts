import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {DiscordModule} from "../discord/discord.module";
import {EmbedModule} from "../embed";
import {CommandsModule} from "../marshal";
import {DiscordSyncMarshal} from "./discord-sync.marshal";

@Module({
    imports: [
        DiscordModule,
        CommandsModule,
        CoreModule,
        EmbedModule,
    ],
    providers: [DiscordSyncMarshal],
})
export class EventsModule {}
