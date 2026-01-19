import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { GetGameByGameModeResponse } from '@sprocketbot/common';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';

import { GameModeService } from '../game-mode';

@Controller('game')
export class GameController {
  constructor(private readonly gameModeService: GameModeService) {}

  @MessagePattern(CoreEndpoint.GetGameByGameMode)
  async getGameByGameMode(@Payload() payload: unknown): Promise<GetGameByGameModeResponse> {
    const data = CoreSchemas[CoreEndpoint.GetGameByGameMode].input.parse(payload);
    const gameMode = await this.gameModeService.getGameModeById(data.gameModeId, {
      relations: { game: true },
    });
    const res: GetGameByGameModeResponse = {
      id: gameMode.game.id,
      title: gameMode.game.title,
      mode: {
        id: gameMode.id,
        description: gameMode.description,
        teamCount: gameMode.teamCount,
        teamSize: gameMode.teamSize,
      },
    };

    return res;
  }
}
