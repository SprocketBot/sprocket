import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Franchise, Photo} from "$models";
import {FranchiseProfile} from "$models";
import {PopulateService} from "$util";

@Resolver(() => FranchiseProfile)
export class FranchiseProfileResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async photo(@Root() franchiseProfile: FranchiseProfile): Promise<Photo | undefined> {
        return franchiseProfile.photo ?? this.popService.populateOne(FranchiseProfile, franchiseProfile, "photo");
    }

    @ResolveField()
    async franchise(@Root() franchiseProfile: Partial<FranchiseProfile>): Promise<Franchise> {
        return (
            franchiseProfile.franchise ??
            this.popService.populateOneOrFail(FranchiseProfile, franchiseProfile as FranchiseProfile, "franchise")
        );
    }
}
