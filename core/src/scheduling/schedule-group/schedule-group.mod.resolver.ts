import {UseGuards} from "@nestjs/common";
import {Args, Query, Resolver} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {ScheduleGroup, ScheduleGroupType} from "../../database";
import {CurrentUser, UserPayload} from "../../identity";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {ScheduleGroupService} from "./schedule-group.service";
import {ScheduleGroupTypeService} from "./schedule-group-type.service";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ScheduleGroupModResolver {
    constructor(
        private readonly scheduleGroupService: ScheduleGroupService,
        private readonly scheduleGroupTypeService: ScheduleGroupTypeService,
    ) {}

    // TODO: ScheduleGroupType resolver?
    @Query(() => [ScheduleGroupType])
    async getScheduleGroupTypes(
        @CurrentUser() user: UserPayload,
    ): Promise<ScheduleGroupType[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupTypeService.getScheduleGroupTypes(
            user.currentOrganizationId,
        );
    }

    @Query(() => [ScheduleGroup])
    async getScheduleGroups(
        @CurrentUser() user: UserPayload,
        @Args("type") type: string,
        @Args("game", {nullable: true}) gameId?: number,
    ): Promise<ScheduleGroup[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupService.getScheduleGroups(
            user.currentOrganizationId,
            type,
            gameId,
        );
    }
}
