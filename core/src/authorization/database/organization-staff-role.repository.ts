import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {OrganizationStaffRole} from "./organization-staff-role.entity";

@Injectable()
export class OrganizationStaffRoleRepository extends ExtendedRepository<OrganizationStaffRole> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffRole, dataSource);
    }
}
