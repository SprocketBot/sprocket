import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {FranchiseProfile} from "$models";
import {FranchiseProfileRepository} from "$repositories";

import {FranchiseService} from "./franchise.service";

@Controller("franchise")
export class FranchiseController {
    constructor(
        private readonly franchiseService: FranchiseService,
        private readonly franchiseProfileRepository: FranchiseProfileRepository,
    ) {}

    @MessagePattern(CoreEndpoint.GetFranchiseProfile)
    async getFranchiseProfile(@Payload() payload: unknown): Promise<FranchiseProfile> {
        const data = CoreSchemas.GetFranchiseProfile.input.parse(payload);
        return this.franchiseProfileRepository.getByFranchiseId(data.franchiseId);
    }

    @MessagePattern(CoreEndpoint.GetPlayerFranchises)
    async getPlayerFranchises(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        const data = CoreSchemas.GetPlayerFranchises.input.parse(payload);

        return this.franchiseService.getPlayerFranchises(data.memberId);
    }
}
