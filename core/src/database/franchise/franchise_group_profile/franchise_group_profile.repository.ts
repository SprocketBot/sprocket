import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseGroupProfile} from "./franchise_group_profile.model";

@Injectable()
export class FranchiseGroupProfileRepository extends ExtendedRepository<FranchiseGroupProfile> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseGroupProfile, dataSource);
    }
}
