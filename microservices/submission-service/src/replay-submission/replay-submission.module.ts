import {Module} from "@nestjs/common";
import {
    CeleryModule,
    EventsModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";

import {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";
import {ReplaySubmissionCrudController} from "./replay-submission-crud/replay-submission-crud.controller";
import {ReplaySubmissionRatificationController, ReplaySubmissionRatificationService} from "./replay-submission-ratification";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";
import {ReplayUploadController} from "./replay-upload.controller";

@Module({
    imports: [RedisModule, MatchmakingModule, EventsModule, MinioModule, CeleryModule],
    providers: [ReplaySubmissionService, ReplaySubmissionCrudService, ReplaySubmissionUtilService, ReplayParseSubscriber, ReplaySubmissionRatificationService],
    controllers: [ReplayUploadController, ReplaySubmissionRatificationController, ReplaySubmissionCrudController],
})
export class ReplaySubmissionModule {}
