import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {MledbMatchService} from "./mledb-match.service";

@Controller("mledb-match")
export class MledbMatchController {
    constructor(private readonly matchService: MledbMatchService) {}
    
    @MessagePattern(CoreEndpoint.GetMleMatchStakeholdersBySprocketMatchId)
    async getMatchStakeholdersBySprocketMatchId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMleMatchStakeholdersBySprocketMatchId>> {
        const data = CoreSchemas.GetMleMatchStakeholdersBySprocketMatchId.input.parse(payload);
        const discordIds = await this.matchService.getMatchStakeholdersBySprocketMatchId(data.matchId);
        return {discordIds};
    }
}
