import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule,
} from "@sprocketbot/common";

import {MatchEventSubscriber} from "./match.event-subscriber";
import {MatchService} from "./match.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        CoreModule,
    ],
    providers: [MatchService, MatchEventSubscriber],
})
export class MatchModule {}
