import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {MLE_Series} from "../database/mledb/Series.model";
import {MLE_TeamRoleUsage} from "../database/mledb/TeamRoleUsage.model";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {OrganizationModule} from "../organization";
import {SchedulingModule} from "../scheduling/scheduling.module";
import {SprocketRatingModule} from "../sprocket-rating";
import {UtilModule} from "../util/util.module";
import {MledbMatchController} from "./mledb-match/mledb-match.controller";
import {MledbMatchService} from "./mledb-match/mledb-match.service";
import {MledbPlayerService} from "./mledb-player";
import {MledbPlayerController} from "./mledb-player/mledb-player.controller";
import {MledbPlayerAccountService} from "./mledb-player-account";
import {MledbFinalizationService} from "./mledb-scrim";
import {MledbNcpTeamRoleUsageResolver, MledbNcpTeamRoleUsageService} from "./mledb-team-role-usage";

@Module({
    imports: [
        TypeOrmModule.forFeature([MLE_TeamRoleUsage, MLE_Series]),
        DatabaseModule,
        GameModule,
        MatchmakingModule,
        SprocketRatingModule,
        UtilModule,
        forwardRef(() => SchedulingModule),
        forwardRef(() => FranchiseModule),
        forwardRef(() => IdentityModule),
        forwardRef(() => OrganizationModule),
    ],
    providers: [
        MledbPlayerService,
        MledbPlayerAccountService,
        MledbFinalizationService,
        MledbMatchService,
        MledbNcpTeamRoleUsageService,
        MledbNcpTeamRoleUsageResolver,
    ],
    exports: [
        MledbMatchService,
        MledbPlayerService,
        MledbPlayerAccountService,
        MledbFinalizationService,
    ],
    controllers: [MledbMatchController, MledbPlayerController],
})
export class MledbInterfaceModule {}
