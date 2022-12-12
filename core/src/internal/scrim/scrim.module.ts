import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {EventsModule, MatchmakingModule, RedisModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {DatabaseModule} from "../../database";
import {EloConnectorModule} from "../../elo/elo-connector";
import {MledbInterfaceModule} from "../../mledb";
import {UtilModule} from "../../util/util.module";
import {ConfigurationModule} from "../configuration";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {OrganizationModule} from "../organization";
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
        RedisModule,
        DatabaseModule,
        OrganizationModule,
        FranchiseModule,
        EloConnectorModule,
        BullModule.registerQueue({name: "scrim"}),
        MledbInterfaceModule,
    ],
    providers: [
        {
            provide: ScrimPubSub,
            useValue: new PubSub(),
        },
        ScrimModuleResolver,
        ScrimModuleResolverPublic,
        ScrimConsumer,
        ScrimService,
        ScrimResolver,
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
