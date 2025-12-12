import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Game} from '$db/game/game/game.model';
import {GameMode} from '$db/game/game_mode/game_mode.model';
import {GameService} from "../game/game.service";

@Resolver(() => GameMode)
export class GameModeResolver {
    constructor(private readonly gameService: GameService) {}

    @ResolveField()
    async game(@Root() root: Partial<GameMode>): Promise<Game> {
        return root.game ?? this.gameService.getGameById(root.gameId!);
    }
}
