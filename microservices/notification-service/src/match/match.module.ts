import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule,
} from "@sprocketbot/common";

import {MatchService} from "./match.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        CoreModule,
    ],
    providers: [MatchService],
})
export class MatchModule {}
