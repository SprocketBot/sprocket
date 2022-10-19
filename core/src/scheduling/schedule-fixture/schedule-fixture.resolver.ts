import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Franchise, Match, ScheduleGroup} from "$models";
import {ScheduleFixture} from "$models";
import {ScheduleFixtureRepository} from "$repositories";
import {PopulateService} from "$util";

@Resolver(() => ScheduleFixture)
export class ScheduleFixtureResolver {
    constructor(
        private readonly scheduleFixtureRepository: ScheduleFixtureRepository,
        private readonly populate: PopulateService,
    ) {}

    @Query(() => ScheduleFixture)
    async getFixture(@Args("id") id: number): Promise<ScheduleFixture> {
        return this.scheduleFixtureRepository.findOneOrFail({where: {id}});
    }

    @ResolveField()
    async scheduleGroup(@Root() root: ScheduleFixture): Promise<ScheduleGroup> {
        if (root.scheduleGroup) return root.scheduleGroup;

        return this.populate.populateOneOrFail(ScheduleFixture, root, "scheduleGroup");
    }

    @ResolveField()
    async homeFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.homeFranchise) return root.homeFranchise;
        return this.populate.populateOneOrFail(ScheduleFixture, root, "homeFranchise");
    }

    @ResolveField()
    async awayFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.awayFranchise) return root.awayFranchise;

        return this.populate.populateOneOrFail(ScheduleFixture, root, "awayFranchise");
    }

    @ResolveField()
    async matches(@Root() root: ScheduleFixture): Promise<Match[]> {
        if (root.matches) return root.matches;
        const t = await this.scheduleFixtureRepository.findOneOrFail({
            where: {
                id: root.id,
            },
            relations: ["matchParents", "matchParents.match"],
        });
        const matches = t.matchParents.flatMap(mp => mp.match);
        return matches;
    }
}
