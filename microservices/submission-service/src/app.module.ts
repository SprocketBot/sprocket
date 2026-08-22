import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {HealthController} from "./health.controller";
import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";
import {ReplayValidationModule} from "./replay-validation/replay-validation.module";

@Module({
    controllers: [HealthController],
    imports: [EventsModule, RedisModule, ReplaySubmissionModule, ReplayValidationModule],
})
export class AppModule {}
