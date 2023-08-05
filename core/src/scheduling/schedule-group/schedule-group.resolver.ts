import { UseGuards } from "@nestjs/common";
import { Args, Query,Resolver } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

import { GraphQLJwtAuthGuard } from "../../authentication/guards";
import { MemberGuard } from "../../authorization/guards";
import { CurrentMember } from "../../authorization/decorators";
import { Member } from "../../organization/database/member.entity";
import { ScheduleGroupObject } from "../graphql/schedule-group/schedule-group.object";
import { ScheduleGroupTypeObject } from "../graphql/schedule-group/schedule-group-type.object";
import { ScheduleGroupService } from "./schedule-group.service";
import { ScheduleGroupTypeService } from "./schedule-group-type.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, MemberGuard)
export class ScheduleGroupResolver {
    constructor(
        private readonly scheduleGroupService: ScheduleGroupService,
        private readonly scheduleGroupTypeService: ScheduleGroupTypeService,
    ) {
    }

    @Query(() => [ScheduleGroupTypeObject])
    async getScheduleGroupTypes(@CurrentMember() member: Member): Promise<ScheduleGroupTypeObject[]> {
        if (!member.organizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupTypeService.getScheduleGroupTypes(member.organizationId);
    }

    @Query(() => [ScheduleGroupObject])
    async getScheduleGroups(
        @CurrentMember() member: Member,
        @Args("type") type: string,
        @Args("game", {nullable: true}) gameId?: number,
        @Args("currentSeason", {defaultValue: true, nullable: true}) current: boolean = true,
    ): Promise<ScheduleGroupObject[]> {
        if (!member.organizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupService.getScheduleGroups(member.organizationId, type, gameId, current);
    }
}
