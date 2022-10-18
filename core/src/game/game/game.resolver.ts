import {Args, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {GameMode} from "$models";
import {Game} from "$models";
import {GameRepository} from "$repositories";
import {PopulateService} from "$util/populate";

@Resolver(() => Game)
export class GameResolver {
    constructor(private readonly gameRepository: GameRepository, private readonly populateService: PopulateService) {}

    @Query(() => Game)
    async getGame(@Args("title") title: string): Promise<Game> {
        return this.gameRepository.getByTitle(title);
    }

    @Query(() => [Game])
    async getGames(): Promise<Game[]> {
        return this.gameRepository.getMany();
    }

    @ResolveField()
    async modes(@Root() game: Game): Promise<GameMode[]> {
        return game.modes ?? (await this.populateService.populateMany(Game, game, "modes"));
    }
}
