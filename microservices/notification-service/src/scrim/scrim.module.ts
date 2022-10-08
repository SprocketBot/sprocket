import {Module} from "@nestjs/common";
import {
    BotModule,
    CoreModule,
    EventsModule,
    MatchmakingModule,
} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";

@Module({
    imports: [EventsModule, BotModule, MatchmakingModule, CoreModule],
    providers: [ScrimService],
})
export class ScrimModule {}
