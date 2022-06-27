import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {GameSkillGroup} from "../../database";
import {
    Match,
} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => Match)
export class MatchResolver {
    constructor(private readonly populate: PopulateService) {}

    @ResolveField()
    async skillGroup(@Root() root: Match): Promise<GameSkillGroup> {
        if (root.skillGroup) return root.skillGroup;
        return this.populate.populateOneOrFail(Match, root, "skillGroup");
    }
}
