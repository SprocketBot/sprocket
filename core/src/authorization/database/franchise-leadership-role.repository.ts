import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseLeadershipRole} from "./franchise-leadership-role.entity";

@Injectable()
export class FranchiseLeadershipRoleRepository extends ExtendedRepository<FranchiseLeadershipRole> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseLeadershipRole, dataSource);
    }
}
