import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {Organization} from "../../database";
import {Franchise, FranchiseProfile} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => Franchise)
export class FranchiseResolver {
    constructor(
        @InjectRepository(Franchise)
        private readonly franchiseRepo: Repository<Franchise>,
        @InjectRepository(FranchiseProfile)
        private readonly franchiseProfileRepo: Repository<FranchiseProfile>,
        private readonly populate: PopulateService,
    ) {
    }

    @ResolveField()
    async profile(@Root() root: Franchise): Promise<FranchiseProfile> {
        if (root.profile) return root.profile;
        return this.populate.populateOneOrFail(Franchise, root, "profile");
    }

    @ResolveField()
    async organization(@Root() root: Franchise): Promise<Organization> {
        if (root.organization) return root.organization;
        return this.populate.populateOneOrFail(Franchise, root, "organization");
    }
}
