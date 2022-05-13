import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {GameSkillGroup} from "../../database";

@Injectable()
export class GameSkillGroupService {
    constructor(@InjectRepository(GameSkillGroup) private gameSkillGroupRepository: Repository<GameSkillGroup>) {}
    
    async getGameSkillGroup(query: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(query);
    }
    
    async getGameSkillGroupById(id: number): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(id);
    }
}
