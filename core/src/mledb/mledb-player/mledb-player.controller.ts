import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {
    CoreOutput,
} from "@sprocketbot/common";
import {
    CoreEndpoint, CoreSchemas,
} from "@sprocketbot/common";

import {MLE_Platform} from "../../database/mledb";
import {GameSkillGroupService} from "../../franchise";
import {MledbPlayerService} from "./mledb-player.service";

const isMlePlatform = (platformCode: string): platformCode is MLE_Platform => Object.values(MLE_Platform).includes(platformCode as MLE_Platform);

@Controller("mledb-player")
export class MledbPlayerController {
    constructor(
        private readonly mledbPlayerService: MledbPlayerService,
        private readonly skillGroupService: GameSkillGroupService,
    ) {}

    @MessagePattern(CoreEndpoint.GetPlayerByPlatformId)
    async getPlayerByPlatformId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> {
        const {platform, platformId} = CoreSchemas.GetPlayerByPlatformId.input.parse(payload);

        if (!isMlePlatform(platform)) {
            throw new Error(`platformCode must be one of (${Object.values(MLE_Platform)})`);
        }

        const player = await this.mledbPlayerService.getPlayerByPlatformId(platform, platformId);
        const skillGroup = await this.skillGroupService.getGameSkillGroupByMLEDBLeague(player.league);

        // All MLE players should have a discordId
        if (!player.discordId) {
            throw new Error(`Player ${player.id} is missing a discordId`);
        }

        return {
            id: player.id,
            discordId: player.discordId,
            skillGroupId: skillGroup.id,
        };
    }

    @MessagePattern(CoreEndpoint.GetPlayersByPlatformIds)
    async getPlayersByPlatformIds(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayersByPlatformIds>> {
        const platformIds = CoreSchemas.GetPlayersByPlatformIds.input.parse(payload);
        return Promise.all(platformIds.map(async d => this.getPlayerByPlatformId(d)));
    }
}
