import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {Game} from "$models";
import {GameModeRepository} from "$repositories";

@Controller("game")
export class GameController {
    constructor(private readonly gameModeService: GameModeRepository) {}

    @MessagePattern(CoreEndpoint.GetGameByGameMode)
    async getGameByGameMode(@Payload() payload: unknown): Promise<Game> {
        const data = CoreSchemas[CoreEndpoint.GetGameByGameMode].input.parse(payload);
        const gameMode = await this.gameModeService.getById(data.gameModeId, {relations: {game: true}});

        return gameMode.game;
    }
}
