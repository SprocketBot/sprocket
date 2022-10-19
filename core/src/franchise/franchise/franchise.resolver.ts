import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {FranchiseProfile, Organization} from "$models";
import {Franchise} from "$models";
import {PopulateService} from "$util";

@Resolver(() => Franchise)
export class FranchiseResolver {
    constructor(private readonly populate: PopulateService) {}

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
