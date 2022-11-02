import {UseGuards} from "@nestjs/common";
import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {Game, ScheduleFixture, ScheduleGroupType} from "$models";
import {ScheduleGroup} from "$models";
import {ScheduleGroupRepository} from "$repositories";
import {PopulateService} from "$util";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";

@Resolver(() => ScheduleGroup)
export class ScheduleGroupResolver {
    constructor(
        private readonly scheduleGroupRepository: ScheduleGroupRepository,
        private readonly populate: PopulateService,
    ) {}

    @Query(() => [ScheduleGroup])
    @UseGuards(GraphQLJwtAuthGuard)
    async getScheduleGroups(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("type") type: string,
        @Args("game", {nullable: true}) gameId?: number,
    ): Promise<ScheduleGroup[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupRepository.getWithConditions(user.currentOrganizationId, type, gameId);
    }

    @ResolveField()
    async type(@Root() scheduleGroup: Partial<ScheduleGroup>): Promise<ScheduleGroupType> {
        return (
            scheduleGroup.type ?? this.populate.populateOneOrFail(ScheduleGroup, scheduleGroup as ScheduleGroup, "type")
        );
    }

    @ResolveField()
    async game(@Root() scheduleGroup: Partial<ScheduleGroup>): Promise<Game> {
        return (
            scheduleGroup.game ?? this.populate.populateOneOrFail(ScheduleGroup, scheduleGroup as ScheduleGroup, "game")
        );
    }

    @ResolveField()
    async parentGroup(@Root() scheduleGroup: Partial<ScheduleGroup>): Promise<ScheduleGroup | undefined> {
        return (
            scheduleGroup.parentGroup ??
            this.populate.populateOne(ScheduleGroup, scheduleGroup as ScheduleGroup, "parentGroup")
        );
    }

    @ResolveField()
    async childGroups(@Root() scheduleGroup: Partial<ScheduleGroup>): Promise<ScheduleGroup[]> {
        return (
            scheduleGroup.childGroups ??
            this.populate.populateMany(ScheduleGroup, scheduleGroup as ScheduleGroup, "childGroups")
        );
    }

    @ResolveField()
    async fixtures(@Root() scheduleGroup: Partial<ScheduleGroup>): Promise<ScheduleFixture[]> {
        return (
            scheduleGroup.fixtures ??
            this.populate.populateMany(ScheduleGroup, scheduleGroup as ScheduleGroup, "fixtures")
        );
    }
}
