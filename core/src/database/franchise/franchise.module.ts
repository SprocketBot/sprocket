import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Franchise} from "./franchise";
import {FranchiseGroup} from "./franchise_group";
import {FranchiseGroupAssignment} from "./franchise_group_assignment";
import {FranchiseGroupProfile} from "./franchise_group_profile";
import {FranchiseGroupType} from "./franchise_group_type";
import {FranchiseLeadershipAppointment} from "./franchise_leadership_appointment";
import {FranchiseProfile} from "./franchise_profile";
import {FranchiseStaffAppointment} from "./franchise_staff_appointment";
import {GameSkillGroup} from "./game_skill_group";
import {GameSkillGroupProfile} from "./game_skill_group_profile";
import {Player} from "./player";
import {RosterRole} from "./roster_role";
import {RosterRoleUsage} from "./roster_role_usages";
import {RosterRoleUseLimits} from "./roster_role_use_limits";
import {RosterSlot} from "./roster_slot";
import {Team} from "./team";

export const franchiseEntities = [
    FranchiseGroupAssignment,
    FranchiseGroupProfile,
    FranchiseGroupType,
    FranchiseGroup,
    FranchiseLeadershipAppointment,
    FranchiseProfile,
    FranchiseStaffAppointment,
    Franchise,
    GameSkillGroupProfile,
    GameSkillGroup,
    Player,
    RosterRoleUsage,
    RosterRoleUseLimits,
    RosterRole,
    RosterSlot,
    Team,
];

const ormModule = TypeOrmModule.forFeature(franchiseEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class FranchiseModule {
}
