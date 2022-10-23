import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ProfiledRepository} from "../../extended-repositories";
import {ExtendedRepository} from "../../extended-repositories/repository";
import {FranchiseProfileRepository} from "../franchise_profile/franchise_profile.repository";
import type {FranchiseProfile} from "../models";
import {Franchise} from "./franchise.model";

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
