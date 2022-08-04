import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    CeleryModule,
    EventsModule,
    MatchmakingModule,
    MinioModule,
    RedisModule,
    SubmissionModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo-connector/elo-connector.module";
import {FranchiseModule} from "../franchise";
import {IdentityModule} from "../identity";
import {MledbInterfaceModule} from "../mledb";
import {SchedulingModule} from "../scheduling";
import {ScrimModule} from "../scrim";
import {SprocketRatingModule} from "../sprocket-rating/sprocket-rating.module";
import {UtilModule} from "../util/util.module";
import {
    BallchasingConverterService, FinalizationService, FinalizationSubscriber,
} from "./finalization";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseModResolver} from "./replay-parse.mod.resolver";
import {ReplaySubmissionResolver, SubmissionRejectionResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";

@Module({
    imports: [
        SubmissionModule,
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
        IdentityModule,
        SprocketRatingModule,
        EloConnectorModule,
        SchedulingModule,
        UtilModule,
    ],
    providers: [
        ReplayParseModResolver,
        ReplayParseService,
        {
            provide: ReplayParsePubSub,
            useValue: new PubSub(),
        },
        ReplaySubmissionResolver,
        FinalizationService,
        SubmissionRejectionResolver,
        BallchasingConverterService,
        FinalizationSubscriber,
    ],
})
export class ReplayParseModule {
}
