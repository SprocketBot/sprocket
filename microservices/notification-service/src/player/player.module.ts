import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule,
} from "@sprocketbot/common";

import {PlayerService} from "./player.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        CoreModule,
    ],
    providers: [PlayerService],
})
export class PlayerModule {}
