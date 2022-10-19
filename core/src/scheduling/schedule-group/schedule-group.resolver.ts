import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {Game, ScheduleFixture, ScheduleGroupType} from "$models";
import {ScheduleGroup} from "$models";
import {ScheduleGroupRepository} from "$repositories";
import {PopulateService} from "$util";

import {CurrentUser, UserPayload} from "../../identity";

@Resolver(() => ScheduleGroup)
export class ScheduleGroupResolver {
    constructor(
        private readonly scheduleGroupRepository: ScheduleGroupRepository,
        private readonly populate: PopulateService,
    ) {}

    @Query(() => [ScheduleGroup])
    async getScheduleGroups(
        @CurrentUser() user: UserPayload,
        @Args("type") type: string,
        @Args("game", {nullable: true}) gameId?: number,
    ): Promise<ScheduleGroup[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupRepository.getWithConditions(user.currentOrganizationId, type, gameId);
    }

    @ResolveField()
    async type(@Root() root: ScheduleGroup): Promise<ScheduleGroupType> {
        if (root.type) return root.type;
        return this.populate.populateOneOrFail(ScheduleGroup, root, "type");
    }

    @ResolveField()
    async game(@Root() root: ScheduleGroup): Promise<Game> {
        if (root.game) return root.game;
        return this.populate.populateOneOrFail(ScheduleGroup, root, "game");
    }

    @ResolveField()
    async parentGroup(@Root() root: ScheduleGroup): Promise<ScheduleGroup | undefined> {
        if (root.parentGroup) return root.parentGroup;
        return this.populate.populateOne(ScheduleGroup, root, "parentGroup");
    }

    @ResolveField()
    async childGroups(@Root() root: ScheduleGroup): Promise<ScheduleGroup[]> {
        if (root.childGroups) return root.childGroups;
        return this.populate.populateMany(ScheduleGroup, root, "childGroups");
    }

    @ResolveField()
    async fixtures(@Root() root: ScheduleGroup): Promise<ScheduleFixture[]> {
        if (root.fixtures) return root.fixtures;
        return this.populate.populateMany(ScheduleGroup, root, "fixtures");
    }
}
