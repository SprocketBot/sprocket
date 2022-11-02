import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {ScheduleFixture} from "$models";
import {MatchParent} from "$models";
import {PopulateService} from "$util";

@Resolver(() => MatchParent)
export class MatchParentResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    async fixture(@Root() root: MatchParent): Promise<ScheduleFixture | undefined> {
        if (root.fixture) return root.fixture;
        return this.populate.populateOne(MatchParent, root, "fixture");
    }
}
