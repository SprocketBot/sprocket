import {Module} from "@nestjs/common";
import {
    CeleryModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {ScrimModule} from "src/scrim/scrim.module";

import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";
import {ReplaySubmissionModule} from "./replay-submission/replay-submission.module";

@Module({
    imports: [CeleryModule, MinioModule, RedisModule, MatchmakingModule, ScrimModule, ReplaySubmissionModule],
    providers: [
        ReplayParseResolver,
        ReplayParseService,
        {
            provide: ReplayParsePubSub,
            useValue: new PubSub(),
        },
    ],
})
export class ReplayParseModule {}
