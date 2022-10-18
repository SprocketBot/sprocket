import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {GameMode} from "$models";
import {GameModeRepository} from "$repositories";

@Controller("game-mode")
export class GameModeController {
    constructor(private readonly gameModeRepository: GameModeRepository) {}

    @MessagePattern(CoreEndpoint.GetGameModeById)
    async getGameModeById(@Payload() payload: unknown): Promise<GameMode> {
        const data = CoreSchemas[CoreEndpoint.GetGameModeById].input.parse(payload);
        return this.gameModeRepository.getById(data.gameModeId);
    }
}
