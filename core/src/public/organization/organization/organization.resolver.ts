import {Args, Int, Query, Resolver} from "@nestjs/graphql";

import {OrganizationProfiledRepository} from "$repositories";

import {SprocketOrganization} from "./organization.object";

@Resolver(() => SprocketOrganization)
export class SprocketOrganizationResolver {
    constructor(private readonly organizationProfiledRepository: OrganizationProfiledRepository) {}

    @Query(() => SprocketOrganization)
    async getSprocketOrganizationById(@Args("id", {type: () => Int}) id: number): Promise<SprocketOrganization> {
        const organization = await this.organizationProfiledRepository.primaryRepository.getById(id, {
            relations: {profile: true},
        });

        return new SprocketOrganization(organization, organization.profile);
    }
}
