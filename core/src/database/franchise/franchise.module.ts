import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Franchise } from "./franchise/franchise.model";
import { FranchiseGroup } from "./franchise_group/franchise_group.model";
import { FranchiseGroupAssignment } from "./franchise_group_assignment/franchise_group_assignment.model";
import { FranchiseGroupProfile } from "./franchise_group_profile/franchise_group_profile.model";
import { FranchiseGroupType } from "./franchise_group_type/franchise_group_type.model";
import { FranchiseLeadershipAppointment } from "./franchise_leadership_appointment/franchise_leadership_appointment.model";
import { FranchiseProfile } from "./franchise_profile/franchise_profile.model";
import { FranchiseStaffAppointment } from "./franchise_staff_appointment/franchise_staff_appointment.model";
import { GameSkillGroup } from "./game_skill_group/game_skill_group.model";
import { GameSkillGroupProfile } from "./game_skill_group_profile/game_skill_group_profile.model";
import { Player } from "./player/player.model";
import { RosterRole } from "./roster_role/roster_role.model";
import { RosterRoleUsage } from "./roster_role_usages/roster_role_usages.model";
import { RosterRoleUseLimits } from "./roster_role_use_limits/roster_role_use_limits.model";
import { RosterSlot } from "./roster_slot/roster_slot.model";
import { Team } from "./team/team.model";

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
export class FranchiseModule { }
