import {Module} from "@nestjs/common";
import {
    CeleryModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../../database";
import {ScrimModule} from "../../scrim";
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
        ReplaySubmissionService,
    ],
    exports: [
        ReplaySubmissionService,
    ],
})
export class ReplaySubmissionModule {}
