import {Module} from "@nestjs/common";
import {
    CeleryModule, EventsModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ScrimModule} from "../scrim";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";
import {ReplayParseSubscriber} from "./replay-parse.subscriber";
import {ReplaySubmissionModule} from "./replay-submission";

@Module({
    imports: [CeleryModule, MinioModule, RedisModule, MatchmakingModule, ScrimModule, ReplaySubmissionModule, EventsModule],
    providers: [
        ReplayParseSubscriber,
        ReplayParseResolver,
        ReplayParseService,
        {
            provide: ReplayParsePubSub,
            useValue: new PubSub(),
        },
    ],
})
export class ReplayParseModule {}
