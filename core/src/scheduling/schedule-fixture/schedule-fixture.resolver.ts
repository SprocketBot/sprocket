import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {Franchise, Match, ScheduleGroup} from "../../database";
import {ScheduleFixture} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => ScheduleFixture)
export class ScheduleFixtureResolver {
    constructor(
        private readonly populate: PopulateService,
        @InjectRepository(ScheduleFixture)
        private readonly scheduleFixtureRepo: Repository<ScheduleFixture>,
    ) {}

    @Query(() => ScheduleFixture)
    async getFixture(@Args("id") id: number): Promise<ScheduleFixture> {
        return this.scheduleFixtureRepo.findOneOrFail({where: {id}});
    }

    @ResolveField()
    async scheduleGroup(@Root() root: ScheduleFixture): Promise<ScheduleGroup> {
        if (root.scheduleGroup) return root.scheduleGroup;

        return this.populate.populateOneOrFail(
            ScheduleFixture,
            root,
            "scheduleGroup",
        );
    }

    @ResolveField()
    async homeFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.homeFranchise) return root.homeFranchise;
        return this.populate.populateOneOrFail(
            ScheduleFixture,
            root,
            "homeFranchise",
        );
    }

    @ResolveField()
    async awayFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.awayFranchise) return root.awayFranchise;

        return this.populate.populateOneOrFail(
            ScheduleFixture,
            root,
            "awayFranchise",
        );
    }

    @ResolveField()
    async matches(@Root() root: ScheduleFixture): Promise<Match[]> {
        if (root.matches) return root.matches;
        const t = await this.scheduleFixtureRepo.findOneOrFail({
            where: {
                id: root.id,
            },
            relations: ["matchParents", "matchParents.match"],
        });
        const matches = t.matchParents.flatMap(mp => mp.match);
        return matches;
    }
}
