import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Franchise} from "./franchise.entity";
import {FranchiseProfiledRepository, FranchiseRepository} from "./franchise.repository";
import {FranchiseGroup} from "./franchise-group.entity";
import {FranchiseGroupRepository} from "./franchise-group.repository";
import {FranchiseGroupAssignment} from "./franchise-group-assignment.entity";
import {FranchiseGroupAssignmentRepository} from "./franchise-group-assignment.repository";
import {FranchiseGroupProfile} from "./franchise-group-profile.entity";
import {FranchiseGroupProfileRepository} from "./franchise-group-profile.repository";
import {FranchiseGroupType} from "./franchise-group-type.entity";
import {FranchiseGroupTypeRepository} from "./franchise-group-type.repository";
import {FranchiseLeadershipAppointment} from "./franchise-leadership-appointment.entity";
import {FranchiseLeadershipAppointmentRepository} from "./franchise-leadership-appointment.repository";
import {FranchiseProfile} from "./franchise-profile.entity";
import {FranchiseProfileRepository} from "./franchise-profile.repository";
import {FranchiseStaffAppointment} from "./franchise-staff-appointment.entity";
import {FranchiseStaffAppointmentRepository} from "./franchise-staff-appointment.repository";
import {GameSkillGroup} from "./game-skill-group.entity";
import {GameSkillGroupProfiledRepository, GameSkillGroupRepository} from "./game-skill-group.repository";
import {GameSkillGroupProfile} from "./game-skill-group-profile.entity";
import {GameSkillGroupProfileRepository} from "./game-skill-group-profile.repository";
import {Player} from "./player.entity";
import {PlayerRepository} from "./player.repository";
import {RosterRole} from "./roster-role.entity";
import {RosterRoleRepository} from "./roster-role.repository";
import {RosterRoleUsage} from "./roster-role-usages.entity";
import {RosterRoleUsageRepository} from "./roster-role-usages.repository";
import {RosterRoleUseLimits} from "./roster-role-use-limits.entity";
import {RosterRoleUseLimitsRepository} from "./roster-role-use-limits.repository";
import {RosterSlot} from "./roster-slot.entity";
import {RosterSlotRepository} from "./roster-slot.repository";
import {Team} from "./team.entity";
import {TeamRepository} from "./team.repository";

const ormModule = TypeOrmModule.forFeature([
    Franchise,
    FranchiseGroup,
    FranchiseGroupAssignment,
    FranchiseGroupProfile,
    FranchiseGroupType,
    FranchiseLeadershipAppointment,
    FranchiseProfile,
    FranchiseStaffAppointment,
    GameSkillGroup,
    GameSkillGroupProfile,
    Player,
    RosterRole,
    RosterRoleUsage,
    RosterRoleUseLimits,
    RosterSlot,
    Team,
]);

const providers = [
    FranchiseRepository,
    FranchiseGroupRepository,
    FranchiseGroupAssignmentRepository,
    FranchiseGroupProfileRepository,
    FranchiseGroupTypeRepository,
    FranchiseLeadershipAppointmentRepository,
    FranchiseProfileRepository,
    FranchiseProfiledRepository,
    FranchiseStaffAppointmentRepository,
    GameSkillGroupRepository,
    GameSkillGroupProfileRepository,
    GameSkillGroupProfiledRepository,
    PlayerRepository,
    RosterRoleRepository,
    RosterRoleUsageRepository,
    RosterRoleUseLimitsRepository,
    RosterSlotRepository,
    TeamRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class FranchiseDatabaseModule {}
