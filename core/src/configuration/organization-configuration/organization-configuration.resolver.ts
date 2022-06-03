import {
    Args, Query, Resolver,
} from "@nestjs/graphql";

import {OrganizationConfigurationKeyCode} from "../../database";
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
