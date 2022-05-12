import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Organization, OrganizationProfile} from "../../database";
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
    async updateOrganizationProfile(
        @Args("id", {type: () => Int}) id: number,
        @Args("profile", {type: () => OrganizationProfileInput}) profile: OrganizationProfileInput,
    ): Promise<OrganizationProfile> {
        return this.organizationService.updateOrganizationProfile(id, profile);
    }

    @ResolveField()
    async organizationProfile(@Root() organization: Partial<Organization>): Promise<OrganizationProfile> {
        return organization.organizationProfile ?? await this.organizationService.getOrganizationProfileForOrganization(organization.id!);
    }
}
