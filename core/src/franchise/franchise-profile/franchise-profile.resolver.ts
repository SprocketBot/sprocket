import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {Photo} from "../../database";
import {FranchiseProfile} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => FranchiseProfile)
export class FranchiseProfileResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async photo(@Root() root: FranchiseProfile): Promise<Photo | undefined> {
        return this.popService.populateOne(FranchiseProfile, root, "photo");
    }
}
