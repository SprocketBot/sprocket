import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    CeleryModule, EventsModule, MatchmakingModule, MinioModule, RedisModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {MledbInterfaceModule} from "../mledb";
import {ScrimModule} from "../scrim";
import {SprocketRatingService} from "../sprocket-rating/sprocket-rating.service";
import {BallchasingConverterService, FinalizationService} from "./finalization";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";
import {ReplayParseSubscriber} from "./replay-parse.subscriber";
import {ReplayRatificationResolver} from "./replay-ratification/replay-ratification.resolver";
import {ReplayRejectionResolver} from "./replay-rejection/replay-rejection.resolver";
import {ReplaySubmissionService} from "./replay-submission";

@Module({
    imports: [
        CeleryModule,
        MinioModule,
        RedisModule,
        MatchmakingModule,
        ScrimModule,
        EventsModule,
        DatabaseModule,
        MledbInterfaceModule,
        AnalyticsModule,
        FranchiseModule,
    ],
    providers: [
        ReplayParseSubscriber,
        ReplayParseResolver,
        ReplayParseService,
        {
            provide: ReplayParsePubSub,
            useValue: new PubSub(),
        },
        ReplayRatificationResolver,
        ReplayRejectionResolver,
        ReplaySubmissionService,
        FinalizationService,
        BallchasingConverterService,
        SprocketRatingService,
    ],
})
export class ReplayParseModule {
}
