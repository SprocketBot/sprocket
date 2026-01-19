import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';

import type { GameMode } from '$db/game/game_mode/game_mode.model';

import { GameModeService } from './game-mode.service';

@Controller('game-mode')
export class GameModeController {
  constructor(private readonly gameModeService: GameModeService) {}

  @MessagePattern(CoreEndpoint.GetGameModeById)
  async getGameModeById(@Payload() payload: unknown): Promise<GameMode> {
    const data = CoreSchemas[CoreEndpoint.GetGameModeById].input.parse(payload);
    return this.gameModeService.getGameModeById(data.gameModeId);
  }
}
