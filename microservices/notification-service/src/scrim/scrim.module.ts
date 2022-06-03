import {Module} from "@nestjs/common";
import {
    BotModule, EventsModule, GqlModule, MatchmakingModule,
} from "@sprocketbot/common";

import {ScrimEventSubscriber} from "./scrim.event-subscriber";
import {ScrimService} from "./scrim.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        MatchmakingModule,
        GqlModule,
    ],
    providers: [
        ScrimService,
        ScrimEventSubscriber,
    ],
})
export class ScrimModule {}
