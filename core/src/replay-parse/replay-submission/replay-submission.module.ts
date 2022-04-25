import {Module} from "@nestjs/common";
import {
    CeleryModule, MatchmakingModule, RedisModule,
} from "@sprocketbot/common";
import {DatabaseModule} from "src/database";

import {ReplaySubmissionResolver} from "./replay-submission.resolver";
import {ReplaySubmissionService} from "./replay-submission.service";

@Module({
    imports: [
        DatabaseModule,
        CeleryModule,
        RedisModule,
        MatchmakingModule,
    ],
    providers: [
        ReplaySubmissionResolver,
        ReplaySubmissionService,
    ],
    exports: [
        ReplaySubmissionService,
    ],
})
export class ReplaySubmissionModule {}
