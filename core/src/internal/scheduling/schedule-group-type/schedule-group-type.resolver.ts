import {UseGuards} from "@nestjs/common";
import {Query, Resolver} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {ScheduleGroupType} from "$models";
import {ScheduleGroupTypeRepository} from "$repositories";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";

@Resolver(() => ScheduleGroupType)
@UseGuards(GraphQLJwtAuthGuard)
export class ScheduleGroupTypeResolver {
    constructor(private readonly scheduleGroupTypeRepository: ScheduleGroupTypeRepository) {}

    @Query(() => [ScheduleGroupType])
    async getScheduleGroupTypes(@AuthenticatedUser() user: JwtAuthPayload): Promise<ScheduleGroupType[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupTypeRepository.getMany({where: {organizationId: user.currentOrganizationId}});
    }
}
