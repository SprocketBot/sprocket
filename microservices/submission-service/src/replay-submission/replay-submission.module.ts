import {Module} from "@nestjs/common";
import {
    CeleryModule, CoreModule,
    EventsModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";

import {ReplayValidationModule} from "../replay-validation/replay-validation.module";
import {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";
import {ReplaySubmissionCrudController} from "./replay-submission-crud/replay-submission-crud.controller";
import {ReplaySubmissionRatificationController, ReplaySubmissionRatificationService} from "./replay-submission-ratification";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";
import {ReplayUploadController} from "./replay-upload.controller";
import {StatsConverterService} from "./stats-converter/stats-converter.service";

@Module({
    imports: [RedisModule, MatchmakingModule, EventsModule, MinioModule, CeleryModule, ReplayValidationModule, CoreModule],
    providers: [ReplaySubmissionService, ReplaySubmissionCrudService, ReplaySubmissionUtilService, ReplayParseSubscriber, ReplaySubmissionRatificationService, StatsConverterService],
    controllers: [ReplayUploadController, ReplaySubmissionRatificationController, ReplaySubmissionCrudController],
})
export class ReplaySubmissionModule {}
