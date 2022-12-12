import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {OrganizationConfigurationKeyTypes} from "./database/organization-configuration-key.enum";
import {OrganizationConfigurationService} from "./organization-configuration.service";

@Controller("organization-configuration")
export class OrganizationConfigurationController {
    constructor(private readonly organizationConfigurationService: OrganizationConfigurationService) {}

    @MessagePattern(CoreEndpoint.GetOrganizationConfigurationValue)
    async getOrganizationConfigurationValue(
        @Payload() payload: unknown,
    ): Promise<OrganizationConfigurationKeyTypes[keyof OrganizationConfigurationKeyTypes]> {
        const data = CoreSchemas.GetOrganizationConfigurationValue.input.parse(payload);
        return this.organizationConfigurationService.getOrganizationConfigurationValue(data.organizationId, data.code);
    }
}
