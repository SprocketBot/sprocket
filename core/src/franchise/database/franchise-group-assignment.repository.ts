import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseGroupAssignment} from "./franchise-group-assignment.entity";

@Injectable()
export class FranchiseGroupAssignmentRepository extends ExtendedRepository<FranchiseGroupAssignment> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupAssignment, dataSource);
    }
}
