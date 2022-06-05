import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule, MatchmakingModule,
} from "@sprocketbot/common";

import {ScrimEventSubscriber} from "./scrim.event-subscriber";
import {ScrimService} from "./scrim.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        MatchmakingModule,
        CoreModule,
    ],
    providers: [
        ScrimService,
        ScrimEventSubscriber,
    ],
})
export class ScrimModule {}
