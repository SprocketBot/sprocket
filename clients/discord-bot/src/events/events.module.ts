import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {EmbedModule} from "../embed";
import {CommandsModule, EventsModule as MEventsModule} from "../marshal";
import {DiscordSyncMarshal} from "./discord-sync.marshal";

@Module({
    imports: [
        CommandsModule,
        MEventsModule,
        CoreModule,
        EmbedModule,
    ],
    providers: [DiscordSyncMarshal],
})
export class EventsModule {}
