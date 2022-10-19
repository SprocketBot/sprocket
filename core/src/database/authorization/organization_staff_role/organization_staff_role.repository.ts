import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {OrganizationStaffRole} from "./organization_staff_role.model";

@Injectable()
export class OrganizationStaffRoleRepository extends ExtendedRepository<OrganizationStaffRole> {
    constructor(readonly dataSource: DataSource) {
        super(OrganizationStaffRole, dataSource);
    }
}
