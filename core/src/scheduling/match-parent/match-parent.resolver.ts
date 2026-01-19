import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {MatchParent} from "$db/scheduling/match_parent/match_parent.model";
import type {ScheduleFixture} from "$db/scheduling/schedule_fixture/schedule_fixture.model";

import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => MatchParent)
export class MatchParentResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    async fixture(@Root() root: MatchParent): Promise<ScheduleFixture | undefined> {
        if (root.fixture) return root.fixture;
        return this.populate.populateOne(MatchParent, root, "fixture");
    }
}
