import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseGroupType} from "./franchise_group_type.model";

@Injectable()
export class FranchiseGroupTypeRepository extends ExtendedRepository<FranchiseGroupType> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupType, dataSource);
    }
}
