import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {Game} from '$db/game/game/game.model';
import {GameModeService} from "../game-mode";

@Controller("game")
export class GameController {
    constructor(private readonly gameModeService: GameModeService) {}

    @MessagePattern(CoreEndpoint.GetGameByGameMode)
    async getGameByGameMode(@Payload() payload: unknown): Promise<Game> {
        const data = CoreSchemas[CoreEndpoint.GetGameByGameMode].input.parse(payload);
        const gameMode = await this.gameModeService.getGameModeById(data.gameModeId, {relations: {game: true} });
        
        return gameMode.game;
    }
}
