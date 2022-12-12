import {Module} from "@nestjs/common";
import {PubSub} from "apollo-server-express";

import {PubSubKey} from "../../types/pubsub.constants";
import {BallchasingConverterService, FinalizationSubscriber} from "./finalization";
import {RocketLeagueFinalizationService} from "./finalization/rocket-league/rocket-league-finalization.service";
import {ReplayParseModResolver} from "./replay-parse.mod.resolver";
import {ReplaySubmissionResolver, SubmissionRejectionResolver} from "./replay-parse.resolver";
import {ReplayParseService} from "./replay-parse.service";

@Module({
    imports: [],
    providers: [
        {
            provide: PubSubKey.ReplayParsing,
            useValue: new PubSub(),
        },
        ReplayParseModResolver,
        ReplayParseService,
        ReplaySubmissionResolver,
        SubmissionRejectionResolver,
        BallchasingConverterService,
        FinalizationSubscriber,
        RocketLeagueFinalizationService,
    ],
})
export class ReplayParseModule {}
