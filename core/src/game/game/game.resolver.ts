import {
    Args, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {GameMode} from "../../database";
import type { Game } from "../../database/game/game/game.model";
import {GameModeService} from "../game-mode";
import {GameService} from "./game.service";

@Resolver(() => Game)
export class GameResolver {
    constructor(
        private readonly gameService: GameService,
        private readonly gameModeService: GameModeService,
    ) {}

    @Query(() => Game)
    async getGame(@Args("title") title: string): Promise<Game> {
        return this.gameService.getGameByTitle(title);
    }

    @Query(() => [Game])
    async getGames(): Promise<Game[]> {
        return this.gameService.getGames({});
    }

    @ResolveField()
    async modes(@Root() root: Game): Promise<GameMode[]> {
        return this.gameModeService.getGameModes({
            where: {
                game: {
                    id: root.id,
                },
            },
        });
    }

}
