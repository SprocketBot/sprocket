import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {GraphQLError} from "graphql";
import {Repository} from "typeorm";

import type {Franchise} from "../../database";
import {
    MatchParent,
    ScheduleFixture, ScheduleGroup,
} from "../../database";
import {FranchiseService} from "../../franchise/franchise";

@Resolver(() => ScheduleFixture)
export class ScheduleFixtureResolver {
    constructor(
@InjectRepository(ScheduleFixture)
              private readonly scheduleFixtureRepo: Repository<ScheduleFixture>,
private readonly franchiseService: FranchiseService,
    ) {}

    @ResolveField()
    async scheduleGroup(@Root() root: ScheduleFixture): Promise<ScheduleGroup> {
        if (root.scheduleGroup) return root.scheduleGroup;

        const relation: ScheduleGroup | undefined = await this.scheduleFixtureRepo.createQueryBuilder()
            .relation(ScheduleGroup, "scheduleGroup")
            .of(root)
            .loadOne();
        if (!relation) throw new GraphQLError("Unable to find fixture group.");
        return relation;
    }

    @ResolveField()
    async homeFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.homeFranchise) return root.homeFranchise;

        return this.franchiseService.getFranchise(root.homeFranchiseId);
    }

    @ResolveField()
    async awayFranchise(@Root() root: ScheduleFixture): Promise<Franchise> {
        if (root.awayFranchise) return root.awayFranchise;

        return this.franchiseService.getFranchise(root.awayFranchiseId);
    }

    @ResolveField()
    async matchParent(@Root() root: ScheduleFixture): Promise<MatchParent> {
        if (root.matchParent) return root.matchParent;

        const relation: MatchParent | undefined = await this.scheduleFixtureRepo.createQueryBuilder()
            .relation(MatchParent, "matchParent")
            .of(root)
            .loadOne();
        if (!relation) throw new GraphQLError("Unable to find fixture parent.");
        return relation;
    }
}
