import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseGroupType} from "./franchise-group-type.entity";

@Injectable()
export class FranchiseGroupTypeRepository extends ExtendedRepository<FranchiseGroupType> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupType, dataSource);
    }
}
