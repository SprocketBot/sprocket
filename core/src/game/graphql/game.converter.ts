import {Injectable} from "@nestjs/common";

import {PopulateService} from "$util";

import {GameSkillGroupConverter} from "../../franchise/graphql/game-skill-group.converter";
import {Game} from "../database/game.entity";
import type {GameObject} from "./game.object";

@Injectable()
export class GameConverter {
    constructor(
        private readonly populateService: PopulateService,
        private readonly gameSkillGroupConverter: GameSkillGroupConverter,
    ) {}

    async convertGameToObject(game: Game): Promise<GameObject> {
        const skillGroupEntities =
            game.skillGroups ?? (await this.populateService.populateMany(Game, game, "skillGroups")) ?? [];
        return {
            id: game.id,
            title: game.title,
            modes: game.modes ?? (await this.populateService.populateMany(Game, game, "modes")) ?? [],
            skillGroups: await Promise.all(
                skillGroupEntities.map(sge => this.gameSkillGroupConverter.convertGameSkillGroupToObject(sge)),
            ),
            supportedPlatforms:
                game.supportedFeatures ??
                (await this.populateService.populateMany(Game, game, "supportedPlatforms")) ??
                [],
        };
    }
}
