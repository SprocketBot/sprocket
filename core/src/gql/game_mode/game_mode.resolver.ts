import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { GameModeObject } from './game_mode.object';
import { GameObject } from '../game/game.object';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { GameRepository } from '../../db/game/game.repository';

@Resolver(() => GameModeObject)
export class GameModeResolver {
  constructor(
    private readonly gameModeRepo: GameModeRepository,
    private readonly gameRepo: GameRepository,
  ) { }
  @ResolveField(() => GameObject)
  async game(@Root() root: GameModeObject) {
    if (root.game) return root.game;
    // We need to get the game from the database - this assumes there's a relationship
    // For now, let's return null or handle it appropriately
    return null;
  }
}
