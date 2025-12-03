import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type { Team } from "../../database/franchise/team/team.model";

@Injectable()
export class TeamService {
    constructor(@InjectRepository(Team)  private readonly teamRepo: Repository<Team>) {}

    async getTeam(franchiseId: number, gameSkillGroupId: number): Promise<Team> {
        return this.teamRepo.findOneOrFail({
            where: {
                franchise: {
                    id: franchiseId,
                },
                skillGroup: {
                    id: gameSkillGroupId,
                },
            },
            relations: {
                franchise: true,
                skillGroup: true,
            },
        });
    }

}
