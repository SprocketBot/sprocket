import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Franchise, Photo} from "../../database";
import {FranchiseProfile} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => FranchiseProfile)
export class FranchiseProfileResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async photo(@Root() root: FranchiseProfile): Promise<Photo | undefined> {
        if (root.photo) return root.photo;
        return this.popService.populateOne(FranchiseProfile, root, "photo");
    }

    @ResolveField()
    async franchise(@Root() root: FranchiseProfile): Promise<Franchise> {
        if (root.franchise) return root.franchise;
        return this.popService.populateOneOrFail(
            FranchiseProfile,
            root,
            "franchise",
        );
    }
}
