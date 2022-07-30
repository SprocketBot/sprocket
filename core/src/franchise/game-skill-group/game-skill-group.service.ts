import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type {GameSkillGroupProfile} from "../../database";
import {GameSkillGroup} from "../../database";
import {League} from "../../database/mledb";

@Injectable()
export class GameSkillGroupService {
    constructor(@InjectRepository(GameSkillGroup) private gameSkillGroupRepository: Repository<GameSkillGroup>) {}
    
    async getGameSkillGroup(query: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(query);
    }
    
    async getGameSkillGroupById(id: number, options?: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(id, options);
    }

    async getGameSkillGroupProfile(skillGroupId: number): Promise<GameSkillGroupProfile> {
        const skillGroup = await this.gameSkillGroupRepository.findOneOrFail({where: {id: skillGroupId}, relations: ["profile"] });
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
                throw new Error(`Unknown league ${league}`);
        }
        return this.getGameSkillGroup({
            where: {profile: {code} },
            relations: ["profile"],
        });
    }
}
