import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Game} from "$models";
import {GameMode} from "$models";
import {PopulateService} from "$util/populate";

@Resolver(() => GameMode)
export class GameModeResolver {
    constructor(private readonly populateService: PopulateService) {}

    @ResolveField()
    async game(@Root() gameMode: Partial<GameMode>): Promise<Game> {
        return gameMode.game ?? this.populateService.populateOneOrFail(GameMode, gameMode as GameMode, "game");
    }
}
