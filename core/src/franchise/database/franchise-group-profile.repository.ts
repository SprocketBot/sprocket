import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseGroupProfile} from "./franchise-group-profile.entity";

@Injectable()
export class FranchiseGroupProfileRepository extends ExtendedRepository<FranchiseGroupProfile> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupProfile, dataSource);
    }
}
