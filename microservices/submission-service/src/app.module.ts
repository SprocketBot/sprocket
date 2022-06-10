import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";

@Module({
    controllers: [],
    imports: [EventsModule, RedisModule, ReplaySubmissionModule],
})
export class AppModule {
}
