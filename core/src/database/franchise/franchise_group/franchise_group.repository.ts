import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseGroup} from "./franchise_group.model";

@Injectable()
export class FranchiseGroupRepository extends ExtendedRepository<FranchiseGroup> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroup, dataSource);
    }
}
