import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {Game, GameSkillGroupProfile} from "../../database";
import {GameSkillGroup} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => GameSkillGroup)
export class GameSkillGroupResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(@Root() root: GameSkillGroup): Promise<GameSkillGroupProfile> {
        return this.popService.populateOneOrFail(GameSkillGroup, root, "profile");
    }

    @ResolveField()
    async game(@Root() root: GameSkillGroup): Promise<Game> {
        return this.popService.populateOneOrFail(GameSkillGroup, root, "game");
    }
}
