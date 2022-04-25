import {
    Args, Query, Resolver,
} from "@nestjs/graphql";

import {OrganizationConfigurationService} from "./organization-configuration.service";
import {OrganizationConfiguration} from "./organization-configuration.types";

@Resolver(() => OrganizationConfiguration)
export class OrganizationConfigurationResolver {
    constructor(private readonly ocService: OrganizationConfigurationService) {}

    @Query(() => [OrganizationConfiguration])
    async getOrganizationConfigurations(
        @Args("organizationId") organizationId: number,
        @Args("key", {nullable: true}) key?: string,
    ): Promise<OrganizationConfiguration[]> {
        const configs = await this.ocService.getOrganizationConfigurations(organizationId, key);
        return configs;
    }
}
