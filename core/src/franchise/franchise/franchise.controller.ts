import {
    Controller,
} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import type { CoreOutput } from "@sprocketbot/common";
import {
    CoreEndpoint, CoreSchemas,
} from "@sprocketbot/common";

import type { FranchiseProfile } from "../../database/franchise/franchise_profile/franchise_profile.model";
import { FranchiseService } from "./franchise.service";

@Controller("franchise")
export class FranchiseController {
    constructor(private readonly franchiseService: FranchiseService) { }

    @MessagePattern(CoreEndpoint.GetFranchiseProfile)
    async getFranchiseProfile(@Payload() payload: unknown): Promise<FranchiseProfile> {
        const data = CoreSchemas.GetFranchiseProfile.input.parse(payload);
        return this.franchiseService.getFranchiseProfile(data.franchiseId);
    }

    @MessagePattern(CoreEndpoint.GetPlayerFranchises)
    async getPlayerFranchises(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        const data = CoreSchemas.GetPlayerFranchises.input.parse(payload);

        return this.franchiseService.getPlayerFranchisesByMemberId(data.memberId);
    }
}
