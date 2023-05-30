import {Injectable} from "@nestjs/common";

import {PopulateService} from "../../util";
import {GameSkillGroup} from "../database/game-skill-group.entity";
import type {GameSkillGroupObject} from "./game-skill-group.object";

@Injectable()
export class GameSkillGroupConverter {
    constructor(private readonly populateService: PopulateService) {}

    async convertGameSkillGroupToObject(gsg: GameSkillGroup): Promise<GameSkillGroupObject> {
        const profile = gsg.profile ?? (await this.populateService.populateOne(GameSkillGroup, gsg, "profile"))!;
        return {
            id: gsg.id,
            ordinal: gsg.ordinal,
            salaryCap: gsg.salaryCap,
            gameId: gsg.gameId,
            organizationId: gsg.organizationId,
            description: profile.description,
            color: profile.color,
            code: profile.code,
            createdAt: gsg.createdAt,
        };
    }
}
