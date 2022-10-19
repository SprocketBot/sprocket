import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {EventsModule, MatchmakingModule, RedisModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {AuthModule} from "../identity";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationModule} from "../organization";
import {MatchService, RoundService} from "../scheduling";
import {UtilModule} from "../util/util.module";
import {ScrimPubSub} from "./constants";
import {ScrimMetricsResolver} from "./metrics";
import {ScrimConsumer} from "./scrim.consumer";
import {ScrimController} from "./scrim.controller";
import {ScrimManagementResolver} from "./scrim.management/scrim.management.resolver";
import {ScrimModuleResolver, ScrimModuleResolverPublic} from "./scrim.mod.resolver";
import {ScrimResolver} from "./scrim.resolver";
import {ScrimService} from "./scrim.service";
import {ScrimMetaCrudService} from "./scrim-crud";
import {ScrimToggleResolver, ScrimToggleService} from "./scrim-toggle";

@Module({
    imports: [
        UtilModule,
        ConfigurationModule,
        MatchmakingModule,
        EventsModule,
        GameModule,
        AuthModule,
        RedisModule,
        MatchmakingModule,
        DatabaseModule,
        OrganizationModule,
        FranchiseModule,
        MledbInterfaceModule,
        EloConnectorModule,
        BullModule.registerQueue({name: "scrim"}),
    ],
    providers: [
        ScrimModuleResolver,
        ScrimModuleResolverPublic,
        {
            provide: ScrimPubSub,
            useValue: new PubSub(),
        },
        ScrimConsumer,
        ScrimService,
        ScrimResolver,
        MatchService,
        RoundService,
        ScrimMetricsResolver,
        ScrimMetaCrudService,
        ScrimManagementResolver,
        ScrimToggleService,
        ScrimToggleResolver,
    ],
    exports: [ScrimService],
    controllers: [ScrimController],
})
export class ScrimModule {}
