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
    async scheduleGroup(@Root() scheduleFixture: Partial<ScheduleFixture>): Promise<ScheduleGroup> {
        return (
            scheduleFixture.scheduleGroup ??
            this.populate.populateOneOrFail(ScheduleFixture, scheduleFixture as ScheduleFixture, "scheduleGroup")
        );
    }

    @ResolveField()
    async homeFranchise(@Root() scheduleFixture: Partial<ScheduleFixture>): Promise<Franchise> {
        return (
            scheduleFixture.homeFranchise ??
            this.populate.populateOneOrFail(ScheduleFixture, scheduleFixture as ScheduleFixture, "homeFranchise")
        );
    }

    @ResolveField()
    async awayFranchise(@Root() scheduleFixture: Partial<ScheduleFixture>): Promise<Franchise> {
        return (
            scheduleFixture.awayFranchise ??
            this.populate.populateOneOrFail(ScheduleFixture, scheduleFixture as ScheduleFixture, "awayFranchise")
        );
    }

    @ResolveField()
    async matches(@Root() scheduleFixture: Partial<ScheduleFixture>): Promise<Match[]> {
        if (scheduleFixture.matches) return scheduleFixture.matches;
        const t = await this.scheduleFixtureRepository.findOneOrFail({
            where: {
                id: scheduleFixture.id,
            },
            relations: {matchParents: {match: true}},
        });
        const matches = t.matchParents.flatMap(mp => mp.match);
        return matches;
    }
}
