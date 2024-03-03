import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {Game} from "../../database";
import {GameMode} from "../../database";
import {GameService} from "../game/game.service";

@Resolver(() => GameMode)
export class GameModeResolver {
    constructor(private readonly gameService: GameService) {}

    @ResolveField()
    async game(@Root() root: Partial<GameMode>): Promise<Game> {
        return root.game ?? this.gameService.getGameById(root.gameId!);
    }
}
