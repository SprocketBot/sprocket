import {Module} from "@nestjs/common";

import {EventsService} from "./events.service";
import {RmqService} from "./rmq.service";

@Module({
    providers: [EventsService, RmqService],
    exports: [EventsService],
})
export class EventsModule {
}
