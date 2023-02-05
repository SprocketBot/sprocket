import {forwardRef, Module} from "@nestjs/common";

import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseDatabaseModule} from "../franchise/database/franchise-database.module";
import {GameDatabaseModule} from "../game/database/game-database.module";
import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {SchedulingDatabaseModule} from "../scheduling/database/scheduling-database.module";
import {SchedulingModule} from "../scheduling/scheduling.module";
import {UtilModule} from "../util";
import {MledbModule} from "./database";
import {MledbBridgeModule} from "./mledb-bridge/mledb_bridge.module";
import {MledbMatchController} from "./mledb-match/mledb-match.controller";
import {MledbMatchService} from "./mledb-match/mledb-match.service";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerController} from "./mledb-player/mledb-player.controller";
import {MledbPlayerResolver} from "./mledb-player/mledb-player.resolver";
import {MledbFinalizationService} from "./mledb-scrim";

@Module({
    imports: [
        MledbModule,
        MledbBridgeModule,
        IdentityDatabaseModule,
        FranchiseDatabaseModule,
        OrganizationDatabaseModule,
        EloConnectorModule,
        GameDatabaseModule,
        forwardRef(() => SchedulingModule),
        SchedulingDatabaseModule,
        UtilModule,
    ],
    providers: [MledbPlayerService, MledbPlayerResolver, MledbFinalizationService, MledbMatchService],
    exports: [MledbMatchService, MledbPlayerService, MledbFinalizationService],
    controllers: [MledbMatchController, MledbPlayerController],
})
export class MledbInterfaceModule {}
