import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseGroup} from "./franchise-group.entity";

@Injectable()
export class FranchiseGroupRepository extends ExtendedRepository<FranchiseGroup> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroup, dataSource);
    }
}
