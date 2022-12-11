import {Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {FranchiseProfile} from "./franchise-profile.entity";

@Injectable()
export class FranchiseProfileRepository extends ExtendedRepository<FranchiseProfile> {
    constructor(readonly dataSource: DataSource) {
        super(FranchiseProfile, dataSource);
    }

    async getByFranchiseId(franchiseId: number, options?: FindOneOptions<FranchiseProfile>): Promise<FranchiseProfile> {
        return this.findOneOrFail(Object.assign({where: {franchiseId}}, options));
    }
}
