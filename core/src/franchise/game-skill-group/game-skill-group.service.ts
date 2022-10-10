import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";
import type {FindOneOptions, FindOptionsWhere} from "typeorm";
import {Repository} from "typeorm";

import {GameSkillGroup, GameSkillGroupProfile} from "../../database";
import {League} from "../../database/mledb";

@Injectable()
export class GameSkillGroupService {
    constructor(
        @InjectRepository(GameSkillGroup)
        private gameSkillGroupRepository: Repository<GameSkillGroup>,
        @InjectRepository(GameSkillGroupProfile)
        private gameSkillGroupProfileRepository: Repository<GameSkillGroupProfile>,
    ) {}

    async getGameSkillGroup(query: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(query);
    }

    async getGameSkillGroupById(id: number, options?: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail({
            ...options,
            where: {
                id,
                ...options?.where,
            } as FindOptionsWhere<GameSkillGroup>,
        });
    }

    async getGameSkillGroupProfile(skillGroupId: number): Promise<GameSkillGroupProfile> {
        const skillGroup = await this.gameSkillGroupRepository.findOneOrFail({
            where: {id: skillGroupId},
            relations: {profile: {photo: true}},
        });
        return skillGroup.profile;
    }

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
        return this.getGameSkillGroup({
            where: {profile: {code}},
            relations: ["profile"],
        });
    }

    async getSkillGroupWebhooks(skillGroupId: number): Promise<CoreOutput<CoreEndpoint.GetSkillGroupWebhooks>> {
        const skillGroup = await this.gameSkillGroupProfileRepository.findOneOrFail({
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
