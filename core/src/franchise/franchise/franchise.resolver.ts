import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Franchise} from "$db/franchise/franchise/franchise.model";
import type {FranchiseProfile} from "$db/franchise/franchise_profile/franchise_profile.model";
import type {Organization} from "$db/organization/organization/organization.model";

import {PopulateService} from "../../util/populate/populate.service";

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
