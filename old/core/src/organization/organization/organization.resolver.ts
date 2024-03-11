import {UseGuards} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Organization, OrganizationProfile} from "../../database";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {OrganizationProfileInput} from "./inputs";
import {OrganizationService} from "./organization.service";

@Resolver(() => Organization)
export class OrganizationResolver {
    constructor(private readonly organizationService: OrganizationService) {}

    @Query(() => Organization)
    async getOrganizationById(@Args("id", {type: () => Int}) id: number): Promise<Organization> {
        return this.organizationService.getOrganizationById(id);
    }

    @Mutation(() => OrganizationProfile)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.COUNCIL]))
    async updateOrganizationProfile(
        @Args("id", {type: () => Int}) id: number,
        @Args("profile", {type: () => OrganizationProfileInput}) profile: OrganizationProfileInput,
    ): Promise<OrganizationProfile> {
        return this.organizationService.updateOrganizationProfile(id, profile);
    }

    @ResolveField()
    async profile(@Root() organization: Partial<Organization>): Promise<OrganizationProfile> {
        return organization.profile ?? await this.organizationService.getOrganizationProfileForOrganization(organization.id!);
    }
}