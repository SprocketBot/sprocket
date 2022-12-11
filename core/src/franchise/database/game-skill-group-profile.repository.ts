import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {GameSkillGroupProfile} from "./game-skill-group-profile.entity";

@Injectable()
export class GameSkillGroupProfileRepository extends ExtendedRepository<GameSkillGroupProfile> {
    constructor(readonly dataSource: DataSource) {
        super(GameSkillGroupProfile, dataSource);
    }
}
