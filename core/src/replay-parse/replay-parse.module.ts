import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    CeleryModule, EventsModule, MatchmakingModule, MinioModule, RedisModule, SubmissionModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {MledbInterfaceModule} from "../mledb";
import {ScrimModule} from "../scrim";
import {BallchasingConverterService, FinalizationService} from "./finalization";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseModResolver} from "./replay-parse.mod.resolver";
import {ReplaySubmissionResolver} from "./replay-parse.resolver";
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
        BallchasingConverterService,
    ],
})
export class ReplayParseModule {
}
