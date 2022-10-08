import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Game, GameSkillGroupProfile, Player} from "../../database";
import {GameSkillGroup} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => GameSkillGroup)
export class GameSkillGroupResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(
        @Root() root: GameSkillGroup,
    ): Promise<GameSkillGroupProfile> {
        if (root.profile) return root.profile;
        return this.popService.populateOneOrFail(
            GameSkillGroup,
            root,
            "profile",
        );
    }

    @ResolveField()
    async game(@Root() root: GameSkillGroup): Promise<Game> {
        if (root.game) return root.game;
        return this.popService.populateOneOrFail(GameSkillGroup, root, "game");
    }

    @ResolveField()
    async players(@Root() root: GameSkillGroup): Promise<Player[]> {
        if (root.players) return root.players;
        return this.popService.populateMany(GameSkillGroup, root, "players");
    }
}
