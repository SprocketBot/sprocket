import {BullModule} from "@nestjs/bull";
import {forwardRef, Module} from "@nestjs/common";
import {
    EventsModule,
    MatchmakingModule,
    MinioModule,
    RedisModule,
    SubmissionModule,
    UtilModule as CommonUtilModule,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {AuthorizationModule} from "../authorization/authorization.module";
import {ConfigurationModule} from "../configuration/configuration.module";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseDatabaseModule} from "../franchise/database/franchise-database.module";
import {FranchiseModule} from "../franchise/franchise.module";
import {GameDatabaseModule} from "../game/database/game-database.module";
import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {PubSubKey} from "../types/pubsub.constants";
import {UtilModule} from "../util";
import {SchedulingDatabaseModule} from "./database/scheduling-database.module";
import {MatchController} from "./match/match.controller";
import {MatchService} from "./match/match.service";
import {ReplayParseService, ReplaySubmissionResolver, SubmissionRejectionResolver} from "./replay-parse";
import {BallchasingConverterService, FinalizationSubscriber} from "./replay-parse/finalization";
import {RocketLeagueFinalizationService} from "./replay-parse/finalization/rocket-league/rocket-league-finalization.service";
import {ReplayParseModResolver} from "./replay-parse/replay-parse.mod.resolver";
import {ScrimConsumer} from "./scrim/scrim.consumer";
import {ScrimController} from "./scrim/scrim.controller";
import {ScrimPubSub} from "./scrim/scrim.pubsub";
import {ScrimService} from "./scrim/scrim.service";
import {ScrimSubscriber} from "./scrim/scrim.subscriber";
import {ScrimAdminResolver} from "./scrim/scrim-admin.resolver";
import {ScrimPlayerResolver} from "./scrim/scrim-player.resolver";
import {ScrimTogglePubSub} from "./scrim/scrim-toggle/scrim-toggle.pubsub";
import {ScrimToggleResolver} from "./scrim/scrim-toggle/scrim-toggle.resolver";
import {ScrimToggleService} from "./scrim/scrim-toggle/scrim-toggle.service";
import {ScrimToggleSubscriber} from "./scrim/scrim-toggle/scrim-toggle.subscriber";
import {SprocketRatingService} from "./sprocket-rating/sprocket-rating.service";
import {SubmissionService} from "./submission/submission.service";

@Module({
    imports: [
        RedisModule,
        EventsModule,
        MinioModule,
        CommonUtilModule,
        UtilModule,
        EloConnectorModule,
        SchedulingDatabaseModule,
        BullModule.registerQueue({name: "scrim"}),
        forwardRef(() => MledbInterfaceModule),
        SubmissionModule,
        FranchiseDatabaseModule,
        OrganizationDatabaseModule,
        ConfigurationModule,
        forwardRef(() => FranchiseModule),
        GameDatabaseModule,
        MatchmakingModule,
        IdentityDatabaseModule,
        AuthorizationModule,
    ],
    controllers: [MatchController, ScrimController],
    providers: [
        {
            provide: PubSubKey.Scrims,
            useValue: new PubSub(),
        },
        {
            provide: PubSubKey.ScrimToggle,
            useValue: new PubSub(),
        },
        {
            provide: PubSubKey.ReplayParsing,
            useValue: new PubSub(),
        },
        MatchService,
        ScrimToggleService,
        ScrimToggleResolver,
        ScrimTogglePubSub,
        ScrimToggleSubscriber,
        ScrimConsumer,
        ScrimService,
        ScrimPubSub,
        ScrimSubscriber,
        ScrimAdminResolver,
        ScrimPlayerResolver,
        SubmissionService,
        ReplayParseModResolver,
        ReplayParseService,
        ReplaySubmissionResolver,
        SubmissionRejectionResolver,
        BallchasingConverterService,
        FinalizationSubscriber,
        RocketLeagueFinalizationService,
        SprocketRatingService,
    ],
    exports: [SprocketRatingService],
})
export class SchedulingModule {}
