import {BullModule} from "@nestjs/bull";
import {forwardRef, Module} from "@nestjs/common";
import {
    BotModule,
    EventsModule,
    MatchmakingModule,
    MinioModule,
    RedisModule,
    SubmissionModule,
} from "@sprocketbot/common";
import {PubSub} from "graphql-subscriptions";

import {AuthorizationModule} from "../authorization/authorization.module";
import {ConfigurationModule} from "../configuration/configuration.module";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseDatabaseModule} from "../franchise/database/franchise-database.module";
import {FranchiseModule} from "../franchise/franchise.module";
import {GameSkillGroupConverter} from "../franchise/graphql/game-skill-group.converter";
import {GameDatabaseModule} from "../game/database/game-database.module";
import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {PubSubKey} from "../types/pubsub.constants";
import {UtilModule} from "../util";
import {SchedulingDatabaseModule} from "./database/scheduling-database.module";
import {FinalizationSubscriber} from "./finalization/finalization.subscriber";
import {RocketLeagueFinalizationService} from "./finalization/rocket-league-finalization/rocket-league-finalization.service";
import {MatchController} from "./match/match.controller";
import { MatchResolver } from "./match/match.resolver";
import {MatchService} from "./match/match.service";
import { ScheduleGroupResolver } from "./schedule-group/schedule-group.resolver";
import {ScrimConsumer} from "./scrim/scrim.consumer";
import {ScrimController} from "./scrim/scrim.controller";
import {ScrimPubSub} from "./scrim/scrim.pubsub";
import {ScrimResolver} from "./scrim/scrim.resolver";
import {ScrimService} from "./scrim/scrim.service";
import {ScrimAdminResolver} from "./scrim/scrim-admin.resolver";
import {ScrimPlayerResolver} from "./scrim/scrim-player.resolver";
import {ScrimSubscriptionsResolver} from "./scrim/scrim-subscriptions.resolver";
import {ScrimTogglePubSub} from "./scrim/scrim-toggle/scrim-toggle.pubsub";
import {ScrimToggleResolver} from "./scrim/scrim-toggle/scrim-toggle.resolver";
import {ScrimToggleService} from "./scrim/scrim-toggle/scrim-toggle.service";
import {ScrimToggleSubscriber} from "./scrim/scrim-toggle/scrim-toggle.subscriber";
import {SprocketRatingService} from "./sprocket-rating/sprocket-rating.service";
import {SubmissionPubSub} from "./submission/submission.pubsub";
import {SubmissionResolver} from "./submission/submission.resolver";
import {SubmissionService} from "./submission/submission.service";
import {SubmissionSubscriber} from "./submission/submission.subscriber";
import {SubmissionAdminResolver} from "./submission/submission-admin.resolver";
import {SubmissionPlayerResolver} from "./submission/submission-player.resolver";
import { ScheduleGroupService } from "./schedule-group/schedule-group.service";
import { ScheduleGroupTypeService } from "./schedule-group/schedule-group-type.service";
import { ScheduleFixtureResolver } from "./schedule-fixture/schedule-fixture.resolver";
import { MledbModule } from "../mledb/database";

@Module({
    imports: [
        RedisModule,
        EventsModule,
        MinioModule,
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
        BotModule,
        MledbModule,
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
            provide: PubSubKey.Submissions,
            useValue: new PubSub(),
        },
        MatchResolver,
        MatchService,
        ScheduleFixtureResolver,
        ScheduleGroupResolver,
        ScheduleGroupService,
        ScheduleGroupTypeService,
        ScrimToggleService,
        ScrimToggleResolver,
        ScrimTogglePubSub,
        ScrimToggleSubscriber,
        ScrimConsumer,
        ScrimService,
        ScrimPubSub,
        ScrimSubscriptionsResolver,
        ScrimResolver,
        ScrimAdminResolver,
        ScrimPlayerResolver,
        SubmissionService,
        SubmissionPubSub,
        SubmissionSubscriber,
        SubmissionResolver,
        SubmissionAdminResolver,
        SubmissionPlayerResolver,
        FinalizationSubscriber,
        RocketLeagueFinalizationService,
        SprocketRatingService,
        GameSkillGroupConverter,
    ],
    exports: [SprocketRatingService],
})
export class SchedulingModule {}
