import {Module} from "@nestjs/common";

import {PostgresModule} from "../postgres";
import {EventsService} from "./events.service";
import {RmqService} from "./rmq.service";

@Module({
    imports: [PostgresModule],
    providers: [EventsService, RmqService],
    exports: [EventsService],
})
export class EventsModule {}
