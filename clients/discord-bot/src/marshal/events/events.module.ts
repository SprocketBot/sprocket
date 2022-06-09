import {Module} from "@nestjs/common";

import {EventManagerService} from "./event-manager.service";

@Module({
    providers: [EventManagerService],
    exports: [EventManagerService],
})
export class EventsModule {}
