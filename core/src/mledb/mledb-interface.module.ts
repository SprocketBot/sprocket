import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MatchmakingModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseProfile} from "../database/franchise/franchise_profile/franchise_profile.model";
import {RosterRole} from "../database/franchise/roster_role/roster_role.model";
import {RosterRoleUsage} from "../database/franchise/roster_role_usages/roster_role_usages.model";
import {RosterSlot} from "../database/franchise/roster_slot/roster_slot.model";
import {Team} from "../database/franchise/team/team.model";
import {MLE_Series} from "../database/mledb/Series.model";
import {MLE_TeamRoleUsage} from "../database/mledb/TeamRoleUsage.model";
import {SeriesToMatchParent} from "../database/mledb-bridge/series_to_match_parent.model";
import {Match} from "../database/scheduling/match/match.model";
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
        TypeOrmModule.forFeature([
            MLE_TeamRoleUsage,
            MLE_Series,
            SeriesToMatchParent,
            Match,
            FranchiseProfile,
            Team,
            RosterRole,
            RosterSlot,
            RosterRoleUsage,
        ]),
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
