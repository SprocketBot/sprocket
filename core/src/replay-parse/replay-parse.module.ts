import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    CeleryModule,
    EventsModule,
    MatchmakingModule,
    RedisModule,
    S3Module,
    SubmissionModule,
    UtilModule as CommonUtilModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {EloModule} from "../elo/elo.module";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseModule} from "../franchise";
import {IdentityModule} from "../identity";
import {MledbInterfaceModule} from "../mledb";
import {SchedulingModule} from "../scheduling";
import {ScrimModule} from "../scrim";
import {SprocketRatingModule} from "../sprocket-rating/sprocket-rating.module";
import {UtilModule} from "../util/util.module";
import {
    BallchasingConverterService, FinalizationSubscriber,
} from "./finalization";
import {RocketLeagueFinalizationService} from "./finalization/rocket-league/rocket-league-finalization.service";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseModResolver} from "./replay-parse.mod.resolver";
import {ReplaySubmissionResolver, SubmissionRejectionResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";

@Module({
    imports: [
        SubmissionModule,
        CeleryModule,
        S3Module,
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
        EloModule,
        EloConnectorModule,
        SchedulingModule,
        UtilModule,
        CommonUtilModule,

    ],
    providers: [
        ReplayParseModResolver,
        ReplayParseService,
        {
            provide: ReplayParsePubSub,
            useValue: new PubSub(),
        },
        ReplaySubmissionResolver,
        SubmissionRejectionResolver,
        BallchasingConverterService,
        FinalizationSubscriber,
        RocketLeagueFinalizationService,
    ],
})
export class ReplayParseModule {
}
