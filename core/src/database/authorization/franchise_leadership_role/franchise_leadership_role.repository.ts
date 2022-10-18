import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseLeadershipRole} from "./franchise_leadership_role.model";

@Injectable()
export class FranchiseLeadershipRoleRepository extends ExtendedRepository<FranchiseLeadershipRole> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipRole, dataSource);
    }
}
