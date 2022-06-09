import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";
import {ReplayUploadModule} from "./replay-upload/replay-upload.module";

@Module({
    controllers: [],
    imports: [EventsModule, RedisModule, ReplayUploadModule, ReplaySubmissionModule],
})
export class AppModule {
}
