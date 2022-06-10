import {Module} from "@nestjs/common";
import {
    CeleryModule,
    EventsModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";

import {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionController} from "./replay-submission.controller";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";

@Module({
    imports: [RedisModule, MatchmakingModule, EventsModule, MinioModule, CeleryModule],
    providers: [ReplaySubmissionService, ReplaySubmissionCrudService, ReplaySubmissionUtilService, ReplayParseSubscriber],
    controllers: [ReplaySubmissionController],
})
export class ReplaySubmissionModule {

}
