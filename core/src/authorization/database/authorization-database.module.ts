import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Action} from "./action.entity";
import {ActionRepository} from "./action.repository";
import {FranchiseLeadershipRole} from "./franchise-leadership-role.entity";
import {FranchiseLeadershipRoleRepository} from "./franchise-leadership-role.repository";
import {FranchiseLeadershipSeat} from "./franchise-leadership-seat.entity";
import {FranchiseLeadershipSeatRepository} from "./franchise-leadership-seat.repository";
import {FranchiseStaffRole} from "./franchise-staff-role.entity";
import {FranchiseStaffRoleRepository} from "./franchise-staff-role.repository";
import {FranchiseStaffSeat} from "./franchise-staff-seat.entity";
import {FranchiseStaffSeatRepository} from "./franchise-staff-seat.repository";
import {OrganizationStaffPosition} from "./organization-staff-position.entity";
import {OrganizationStaffPositionRepository} from "./organization-staff-position.repository";
import {OrganizationStaffRole} from "./organization-staff-role.entity";
import {OrganizationStaffRoleRepository} from "./organization-staff-role.repository";
import {OrganizationStaffSeat} from "./organization-staff-seat.entity";
import {OrganizationStaffSeatRepository} from "./organization-staff-seat.repository";
import {OrganizationStaffTeam} from "./organization-staff-team.entity";
import {OrganizationStaffTeamRepository} from "./organization-staff-team.repository";
import {PermissionRepository} from "./permission.repository";
import {PermissionBearer} from "./permission-bearer.entity";
import {PermissionBearerRepository} from "./permission-bearer.repository";

const ormModule = TypeOrmModule.forFeature([
    Action,
    FranchiseLeadershipRole,
    FranchiseLeadershipSeat,
    FranchiseStaffRole,
    FranchiseStaffSeat,
    OrganizationStaffPosition,
    OrganizationStaffRole,
    OrganizationStaffSeat,
    OrganizationStaffTeam,
    PermissionBearer,
    Permissions,
]);

const providers = [
    ActionRepository,
    FranchiseLeadershipRoleRepository,
    FranchiseLeadershipSeatRepository,
    FranchiseStaffRoleRepository,
    FranchiseStaffSeatRepository,
    OrganizationStaffPositionRepository,
    OrganizationStaffRoleRepository,
    OrganizationStaffSeatRepository,
    OrganizationStaffTeamRepository,
    PermissionBearerRepository,
    PermissionRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class AuthorizationDatabaseModule {}
