import {Injectable} from "@nestjs/common";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";

import {GameSkillGroupProfiledRepository} from "../database/game-skill-group.repository";

@Injectable()
export class GameSkillGroupService {
    constructor(private readonly skillGroupProfiledRepository: GameSkillGroupProfiledRepository) {}

    async getSkillGroupWebhooks(skillGroupId: number): Promise<CoreOutput<CoreEndpoint.GetSkillGroupWebhooks>> {
        const skillGroup = await this.skillGroupProfiledRepository.profileRepository.findOneOrFail({
            where: {
                skillGroupId: skillGroupId,
            },
            relations: {
                scrimReportCardWebhook: true,
                matchReportCardWebhook: true,
                scrimWebhook: true,
            },
        });

        return {
            scrimReportCards: skillGroup.scrimReportCardWebhook?.url,
            matchReportCards: skillGroup.matchReportCardWebhook?.url,
            scrim: skillGroup.scrimWebhook?.url,
            scrimRole: skillGroup.scrimDiscordRoleId,
        };
    }
}
