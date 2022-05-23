import {Module} from "@nestjs/common";
import {
    CeleryModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../../database";
import {ScrimModule} from "../../scrim";
import {ReplaySubmissionResolver} from "./replay-submission.resolver";
import {ReplaySubmissionService} from "./replay-submission.service";

@Module({
    imports: [
        DatabaseModule,
        CeleryModule,
        RedisModule,
        MatchmakingModule,
        ScrimModule,
        MinioModule,
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
