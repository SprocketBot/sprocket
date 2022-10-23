import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {FranchiseProfile, Organization} from "$models";
import {Franchise} from "$models";
import {PopulateService} from "$util";

@Resolver(() => Franchise)
export class FranchiseResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    async profile(@Root() franchise: Partial<Franchise>): Promise<FranchiseProfile> {
        return franchise.profile ?? this.populate.populateOneOrFail(Franchise, franchise as Franchise, "profile");
    }

    @ResolveField()
    async organization(@Root() franchise: Partial<Franchise>): Promise<Organization> {
        return (
            franchise.organization ?? this.populate.populateOneOrFail(Franchise, franchise as Franchise, "organization")
        );
    }
}
