import {Module} from "@nestjs/common";
import {MatchmakingModule, RedisModule} from "@sprocketbot/common";

import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";

@Module({
    imports: [RedisModule, MatchmakingModule],
    providers: [ReplaySubmissionService, ReplaySubmissionCrudService],
})
export class ReplaySubmissionModule {

}
