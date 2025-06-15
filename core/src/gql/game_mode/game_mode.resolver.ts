import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { GameModeObject } from './game_mode.object';
import { GameObject } from '../game/game.object';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { GameRepository } from '../../db/game/game.repository';

@Resolver(() => GameModeObject)
export class GameModeResolver {
	constructor(
		private readonly gameModeRepo: GameModeRepository,
		private readonly gameRepo: GameRepository
	) {}
	@ResolveField(() => GameObject)
	async game(@Root() root: GameModeObject) {
		if (root.game) return root.game;
		await this.gameRepo.findOneByOrFail({ id: root.game.id });
	}
}
