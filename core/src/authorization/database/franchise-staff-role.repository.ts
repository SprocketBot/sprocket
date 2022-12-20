import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseStaffRole} from "./franchise-staff-role.entity";

@Injectable()
export class FranchiseStaffRoleRepository extends ExtendedRepository<FranchiseStaffRole> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseStaffRole, dataSource);
    }
}
