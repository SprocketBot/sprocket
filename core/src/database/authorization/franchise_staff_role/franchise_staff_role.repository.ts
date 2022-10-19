import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseStaffRole} from "./franchise_staff_role.model";

@Injectable()
export class FranchiseStaffRoleRepository extends ExtendedRepository<FranchiseStaffRole> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffRole, dataSource);
    }
}
