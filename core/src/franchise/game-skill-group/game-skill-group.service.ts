import {Injectable} from "@nestjs/common";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";

import {League} from "$mledb";
import type {GameSkillGroup} from "$models";
import {GameSkillGroupProfiledRepository} from "$repositories";

@Injectable()
export class GameSkillGroupService {
    constructor(private readonly skillGroupProfiledRepository: GameSkillGroupProfiledRepository) {}

    async getGameSkillGroupByMLEDBLeague(league: League): Promise<GameSkillGroup> {
        let code: string;
        switch (league) {
            case League.FOUNDATION:
                code = "FL";
                break;
            case League.ACADEMY:
                code = "AL";
                break;
            case League.CHAMPION:
                code = "CL";
                break;
            case League.MASTER:
                code = "ML";
                break;
            case League.PREMIER:
                code = "PL";
                break;
            default:
                code = league.toString().toUpperCase();
                break;
        }
        return this.skillGroupProfiledRepository.primaryRepository.getByCode(code);
    }

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
