import {Module} from "@nestjs/common";
import {EventsModule, PostgresModule} from "@sprocketbot/common";

import {HealthController} from "./health.controller";
import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";
import {ReplayValidationModule} from "./replay-validation/replay-validation.module";

@Module({
    controllers: [HealthController],
    imports: [EventsModule, PostgresModule, ReplaySubmissionModule, ReplayValidationModule],
})
export class AppModule {}
