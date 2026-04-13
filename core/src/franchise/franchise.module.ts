import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {
    AnalyticsModule, config, EventsModule, NotificationModule,
} from "@sprocketbot/common";

import {FranchiseLeadershipRole} from "../database/authorization/franchise_leadership_role";
import {FranchiseLeadershipSeat} from "../database/authorization/franchise_leadership_seat";
import {FranchiseStaffRole} from "../database/authorization/franchise_staff_role";
import {FranchiseStaffSeat} from "../database/authorization/franchise_staff_seat";
import {FranchiseLeadershipAppointment} from "../database/franchise/franchise_leadership_appointment";
import {FranchiseStaffAppointment} from "../database/franchise/franchise_staff_appointment";
import {Player} from "../database/franchise/player/player.model";
import {RosterRole} from "../database/franchise/roster_role";
import {RosterSlot} from "../database/franchise/roster_slot";
import {Team} from "../database/franchise/team/team.model";
import {DatabaseModule} from "../database";
import {EloConnectorModule} from "../elo/elo-connector";
import {GameModule} from "../game";
import {MLE_Player} from "../database/mledb/Player.model";
import {MLE_Team} from "../database/mledb/Team.model";
import {MLE_TeamToCaptain} from "../database/mledb/TeamToCaptain.model";
import {LeagueToSkillGroup} from "../database/mledb-bridge/league_to_skill_group.model";
import {PlayerToPlayer} from "../database/mledb-bridge/player_to_player.model";
import {TeamToFranchise} from "../database/mledb-bridge/team_to_franchise.model";
import {MledbInterfaceModule} from "../mledb";
import {OrganizationModule} from "../organization/organization.module";
import {UtilModule} from "../util/util.module";
import {FranchiseController} from "./franchise/franchise.controller";
import {FranchiseResolver} from "./franchise/franchise.resolver";
import {FranchiseService} from "./franchise/franchise.service";
import {FranchiseProfileResolver} from "./franchise-profile/franchise-profile.resolver";
import {
    GameSkillGroupController,
    GameSkillGroupResolver,
    GameSkillGroupService,
} from "./game-skill-group";
import {PlayerService} from "./player";
import {PlayerController} from "./player/player.controller";
import {PlayerResolver} from "./player/player.resolver";
import {RosterAuthorityService} from "./roster-authority.service";
import {TeamService} from "./team/team.service";

const rosterAuthorityOrm = TypeOrmModule.forFeature([
    MLE_Player,
    MLE_Team,
    MLE_TeamToCaptain,
    TeamToFranchise,
    LeagueToSkillGroup,
    PlayerToPlayer,
    Player,
    RosterRole,
    RosterSlot,
    Team,
    FranchiseStaffAppointment,
    FranchiseLeadershipAppointment,
    FranchiseStaffRole,
    FranchiseStaffSeat,
    FranchiseLeadershipRole,
    FranchiseLeadershipSeat,
]);

@Module({
    imports: [
        DatabaseModule,
        rosterAuthorityOrm,
        UtilModule,
        NotificationModule,
        EventsModule,
        GameModule,
        forwardRef(() => OrganizationModule),
        forwardRef(() => MledbInterfaceModule),
        EloConnectorModule,
        AnalyticsModule,
        JwtModule.register({
            secret: config.auth.jwt_secret,
        }),
    ],
    providers: [
        PlayerService,
        RosterAuthorityService,
        GameSkillGroupService,
        GameSkillGroupResolver,
        FranchiseService,
        FranchiseResolver,
        FranchiseProfileResolver,
        PlayerResolver,
        TeamService,
    ],
    exports: [PlayerService, FranchiseService, GameSkillGroupService, TeamService, RosterAuthorityService],
    controllers: [FranchiseController, GameSkillGroupController, PlayerController],
})
export class FranchiseModule {}
