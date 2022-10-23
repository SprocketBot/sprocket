import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {GameSkillGroupProfile} from "./game_skill_group_profile.model";

@Injectable()
export class GameSkillGroupProfileRepository extends ExtendedRepository<GameSkillGroupProfile> {
    constructor(readonly dataSource: DataSource) {
        super(GameSkillGroupProfile, dataSource);
    }
}
