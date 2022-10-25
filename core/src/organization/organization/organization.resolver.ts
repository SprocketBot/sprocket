import {UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "$mledb";
import {Organization, OrganizationProfile} from "$models";
import {OrganizationProfiledRepository, OrganizationRepository} from "$repositories";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import {OrganizationProfileInput} from "./inputs";

@Resolver(() => Organization)
export class OrganizationResolver {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly organizationProfiledRepository: OrganizationProfiledRepository,
        private readonly populateService: PopulateService,
    ) {}

    @Query(() => Organization)
    async getOrganizationById(@Args("id", {type: () => Int}) id: number): Promise<Organization> {
        return this.organizationRepository.getById(id);
    }

    @Mutation(() => OrganizationProfile)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.COUNCIL]),
    )
    async updateOrganizationProfile(
        @Args("id", {type: () => Int}) id: number,
        @Args("profile", {type: () => OrganizationProfileInput})
        profile: OrganizationProfileInput,
    ): Promise<OrganizationProfile> {
        const organization = await this.organizationProfiledRepository.updateAndSave(id, {profile});
        return organization.profile;
    }

    @ResolveField()
    async profile(@Root() organization: Partial<Organization>): Promise<OrganizationProfile> {
        return (
            organization.profile ??
            (await this.populateService.populateOneOrFail(Organization, organization as Organization, "profile"))
        );
    }
}
