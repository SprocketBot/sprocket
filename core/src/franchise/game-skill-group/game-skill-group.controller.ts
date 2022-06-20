import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {GameSkillGroupProfile} from "../../database";
import {GameSkillGroupService} from "./game-skill-group.service";

@Controller("game-skill-group")
export class GameSkillGroupController {
    constructor(private readonly gameSkillGroupProfileService: GameSkillGroupService) {}

    @MessagePattern(CoreEndpoint.GetGameSkillGroupProfile)
    async getGameSkillGroupProfile(@Payload() payload: unknown): Promise<GameSkillGroupProfile> {
        const data = CoreSchemas.GetGameSkillGroupProfile.input.parse(payload);
        return this.gameSkillGroupProfileService.getGameSkillGroupProfile(data.skillGroupId);
    }
}
