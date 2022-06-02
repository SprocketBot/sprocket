import {Module} from "@nestjs/common";
import {BotModule, EventsModule} from "@sprocketbot/common";

import {ScrimEventSubscriber} from "./scrim.event-subscriber";
import {ScrimService} from "./scrim.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
    ],
    providers: [
        ScrimService,
        ScrimEventSubscriber,
    ],
})
export class ScrimModule {}
