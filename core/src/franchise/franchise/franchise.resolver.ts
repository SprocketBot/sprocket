import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {Cache} from "@sprocketbot/common/lib/util/caching";

import type {
    FranchiseProfile, Organization,
} from "../../database";
import {Franchise} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => Franchise)
export class FranchiseResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    @Cache({
        ttl: 20000,
        transformers: {
            root: (root: Franchise) => root.id.toString(),
        },
    })
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
