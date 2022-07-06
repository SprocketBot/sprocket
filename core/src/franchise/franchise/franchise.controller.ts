import {
    Controller, forwardRef, Inject,
} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {
    CoreEndpoint, CoreSchemas,
} from "@sprocketbot/common";

import type {FranchiseProfile} from "../../database";
import {MledbPlayerService} from "../../mledb";
import {FranchiseService} from "./franchise.service";

@Controller("franchise")
export class FranchiseController {
    constructor(
        private readonly franchiseService: FranchiseService,
      @Inject(forwardRef(() => MledbPlayerService))
      private readonly mledbPlayerService: MledbPlayerService,
    ) {}

    @MessagePattern(CoreEndpoint.GetFranchiseProfile)
    async getFranchiseProfile(@Payload() payload: unknown): Promise<FranchiseProfile> {
        const data = CoreSchemas.GetFranchiseProfile.input.parse(payload);
        return this.franchiseService.getFranchiseProfile(data.franchiseId);
    }

    @MessagePattern(CoreEndpoint.GetPlayerFranchises)
    async getPlayerFranchises(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        const data = CoreSchemas.GetPlayerFranchises.input.parse(payload);

        const sprocketMemberId = data.memberId;
        const mlePlayer = await this.mledbPlayerService.getMlePlayerBySprocketUser(sprocketMemberId);

        const playerId = mlePlayer.id;

        const team = await this.mledbPlayerService.getPlayerFranchise(playerId);
        const isCaptain = await this.mledbPlayerService.playerIsCaptain(playerId);

        const staffPositions: Array<{id: number; name: string;}> = [];

        if (team.franchiseManagerId === playerId) {
            staffPositions.push({id: 0, name: "FM"});
        }
        if (team.generalManagerId === playerId) {
            staffPositions.push({id: 0, name: "GM"});
        }
        if (team.doublesAssistantGeneralManagerId === playerId || team.standardAssistantGeneralManagerId === playerId) {
            staffPositions.push({id: 0, name: "AGM"});
        }
        if (isCaptain) {
            staffPositions.push({id: 0, name: "CAP"});
        }

        return [
            {
                id: 0, name: team.name, staffPositions: staffPositions,
            },
        ];

    }
}
