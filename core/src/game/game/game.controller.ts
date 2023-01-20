import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import type {Game} from "../database/game.entity";
import {GameModeRepository} from "../database/game-mode.repository";

@Controller("game")
export class GameController {
    constructor(private readonly gameModeRepository: GameModeRepository) {}

    @MessagePattern(CoreEndpoint.GetGameByGameMode)
    async getGameByGameMode(@Payload() payload: unknown): Promise<Game> {
        const data = CoreSchemas[CoreEndpoint.GetGameByGameMode].input.parse(payload);
        const gameMode = await this.gameModeRepository.findById(data.gameModeId, {relations: {game: true}});

        return gameMode.game;
    }
}
