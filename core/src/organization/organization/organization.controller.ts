import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {OrganizationProfile} from "../../database";
import {OrganizationService} from "./organization.service";

@Controller("organization")
export class OrganizationController {
    constructor(private readonly orgService: OrganizationService) {}

    @MessagePattern(CoreEndpoint.GetOrganizationBranding)
    async getOrganizationBranding(@Payload() payload: unknown): Promise<OrganizationProfile> {
        const data = CoreSchemas.GetOrganizationBranding.input.parse(payload);
        return this.orgService.getOrganizationProfileForOrganization(data.id);
    }
}
