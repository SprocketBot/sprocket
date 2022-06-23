import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {FranchiseProfile} from "../../database";
import {FranchiseService} from "./franchise.service";

@Controller("franchise")
export class FranchiseController {
    constructor(private readonly franchiseService: FranchiseService) {}

    @MessagePattern(CoreEndpoint.GetFranchiseProfile)
    async getFranchiseProfile(@Payload() payload: unknown): Promise<FranchiseProfile> {
        const data = CoreSchemas.GetFranchiseProfile.input.parse(payload);
        return this.franchiseService.getFranchiseProfile(data.franchiseId);
    }
}
