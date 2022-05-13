import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {GameSkillGroup} from "../../database";

@Injectable()
export class GameSkillGroupService {
    constructor(@InjectRepository(GameSkillGroup) private gameSkillGroupRepository: Repository<GameSkillGroup>) {}

    async getGameSkillGroupById(id: number): Promise<GameSkillGroup> {
        return this.gameSkillGroupRepository.findOneOrFail(id);
    }
}
