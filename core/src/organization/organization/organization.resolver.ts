import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Organization, OrganizationProfile} from "../../database";
import {OrganizationProfileInput} from "./inputs";
import {OrganizationService} from "./organization.service";

@Resolver(() => Organization)
export class OrganizationResolver {
    constructor(private readonly service: OrganizationService) {}

    @Query(() => Organization)
    async getOrganizationById(@Args("id", {type: () => Int}) id: number): Promise<Organization> {
        return this.service.getOrganizationById(id);
    }

    @ResolveField()
    async organizationProfile(@Root() organization: Organization): Promise<OrganizationProfile> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!organization.organizationProfile) {
            return this.service.getOrganizationProfileForOrganization(organization.id);
        }
        return organization.organizationProfile;
    }

    @Mutation(() => OrganizationProfile)
    async updateOrganizationProfile(
        @Args("id", {type: () => Int}) id: number,
        @Args("profile", {type: () => OrganizationProfileInput}) profile: OrganizationProfileInput,
    ): Promise<OrganizationProfile> {
        return this.service.updateOrganizationProfile(id, profile);
    }
}
