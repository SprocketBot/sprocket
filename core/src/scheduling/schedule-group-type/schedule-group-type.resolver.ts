import {UseGuards} from "@nestjs/common";
import {Query, Resolver} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {ScheduleGroupType} from "$models";
import {ScheduleGroupTypeRepository} from "$repositories";

import {CurrentUser} from "../../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";

@Resolver(() => ScheduleGroupType)
@UseGuards(GqlJwtGuard)
export class ScheduleGroupTypeResolver {
    constructor(private readonly scheduleGroupTypeRepository: ScheduleGroupTypeRepository) {}

    @Query(() => [ScheduleGroupType])
    async getScheduleGroupTypes(@CurrentUser() user: UserPayload): Promise<ScheduleGroupType[]> {
        if (!user.currentOrganizationId) {
            throw new GraphQLError("You must select an organization");
        }
        return this.scheduleGroupTypeRepository.getMany({where: {organizationId: user.currentOrganizationId}});
    }
}
