import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../../database";
import {UtilModule} from "../../util/util.module";
import {EloConnectorModule} from "../elo/elo-connector";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {SchedulingModule} from "../scheduling/scheduling.module";
import {SprocketRatingModule} from "../sprocket-rating";
import {MledbMatchController} from "./mledb-match/mledb-match.controller";
import {MledbMatchService} from "./mledb-match/mledb-match.service";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerResolver} from "./mledb-player/mledb-player.resolver";
import {MledbFinalizationService} from "./mledb-scrim";

@Module({
    imports: [
        DatabaseModule,
        GameModule,
        MatchmakingModule,
        SprocketRatingModule,
        UtilModule,
        EloConnectorModule,
        forwardRef(() => SchedulingModule),
        forwardRef(() => FranchiseModule),
    ],
    providers: [MledbPlayerService, MledbFinalizationService, MledbMatchService, MledbPlayerResolver],
    exports: [MledbMatchService, MledbPlayerService, MledbFinalizationService],
    controllers: [MledbMatchController],
})
export class MledbInterfaceModule {}
