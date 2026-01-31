import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";
import {ReplayValidationModule} from "./replay-validation/replay-validation.module";

@Module({
    controllers: [],
    imports: [EventsModule, RedisModule, ReplaySubmissionModule, ReplayValidationModule],
})
export class AppModule {}
