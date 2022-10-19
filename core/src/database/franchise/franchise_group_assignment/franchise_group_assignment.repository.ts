import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseGroupAssignment} from "./franchise_group_assignment.model";

@Injectable()
export class FranchiseGroupAssignmentRepository extends ExtendedRepository<FranchiseGroupAssignment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupAssignment, dataSource);
    }
}
