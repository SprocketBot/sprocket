import {
    Args, Query, Resolver,
} from "@nestjs/graphql";

import {OrganizationConfigurationKeyCode} from "$db/configuration/organization_configuration_key/organization_configuration_key.enum";

import {OrganizationConfigurationService} from "./organization-configuration.service";
import {OrganizationConfiguration} from "./organization-configuration.types";

@Resolver(() => OrganizationConfiguration)
export class OrganizationConfigurationResolver {
    constructor(private readonly ocService: OrganizationConfigurationService) {}

    @Query(() => [OrganizationConfiguration])
    async getOrganizationConfigurations(
        @Args("organizationId") organizationId: number,
        @Args("key", {nullable: true}) key?: OrganizationConfigurationKeyCode,
    ): Promise<OrganizationConfiguration[]> {
        const configs = await this.ocService.getOrganizationConfigurations(organizationId, key);
        return configs;
    }
}
