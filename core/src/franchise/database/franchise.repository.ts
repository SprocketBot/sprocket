import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../types/extended-repositories";
import {Franchise} from "./franchise.entity";
import type {FranchiseProfile} from "./franchise-profile.entity";
import {FranchiseProfileRepository} from "./franchise-profile.repository";

@Injectable()
export class FranchiseRepository extends ExtendedRepository<Franchise> {
    constructor(readonly dataSource: DataSource) {
        super(Franchise, dataSource);
    }
}

@Injectable()
export class FranchiseProfiledRepository extends ProfiledRepository<Franchise, FranchiseProfile> {
    readonly profileInverseRelationshipName: "franchise";

    constructor(
        @Inject(FranchiseRepository) readonly primaryRepository: FranchiseRepository,
        @Inject(FranchiseProfileRepository) readonly profileRepository: FranchiseProfileRepository,
    ) {
        super();
    }
}
