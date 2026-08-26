import {
    Args, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {Franchise} from "$db/franchise/franchise/franchise.model";
import {Match} from "$db/scheduling/match/match.model";
import {ScheduleFixture} from "$db/scheduling/schedule_fixture/schedule_fixture.model";
import type {ScheduleGroup} from "$db/scheduling/schedule_group/schedule_group.model";

import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => ScheduleFixture)
export class ScheduleFixtureResolver {
    constructor(
        private readonly populate: PopulateService,
    @InjectRepository(ScheduleFixture)
    private readonly scheduleFixtureRepo: Repository<ScheduleFixture>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    ) {}

    @Query(() => ScheduleFixture)
    async getFixture(@Args("id") id: number): Promise<ScheduleFixture> {
        return this.scheduleFixtureRepo.findOneOrFail({where: {id} });
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

        console.log(`[ScheduleFixture.matches] Loading matches for fixture ${root.id}`);

        // Use QueryBuilder to explicitly join through matchParent
        const matches = await this.matchRepo
            .createQueryBuilder("match")
            .innerJoin("match.matchParent", "matchParent")
            .where("matchParent.fixtureId = :fixtureId", {fixtureId: root.id})
            .getMany();

        console.log(`[ScheduleFixture.matches] Found ${matches.length} matches via QueryBuilder`);

        return matches;
    }
}
