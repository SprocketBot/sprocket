import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Action} from "./action";
import {FranchiseLeadershipRole} from "./franchise_leadership_role";
import {FranchiseLeadershipSeat} from "./franchise_leadership_seat";
import {FranchiseStaffRole} from "./franchise_staff_role";
import {FranchiseStaffSeat} from "./franchise_staff_seat";
import {OrganizationStaffPosition} from "./organization_staff_position";
import {OrganizationStaffRole} from "./organization_staff_role";
import {OrganizationStaffSeat} from "./organization_staff_seat";
import {OrganizationStaffTeam} from "./organization_staff_team";
import {PermissionBearer} from "./permission_bearer";
import {Permission} from "./permissions";

export const authorizationEntities = [
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
    Permission,
];
const ormModule = TypeOrmModule.forFeature(authorizationEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class AuthorizationModule {
}
