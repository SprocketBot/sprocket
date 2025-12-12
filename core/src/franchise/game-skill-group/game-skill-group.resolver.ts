import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {Game} from '$db/game/game/game.model';
import {GameSkillGroupProfile} from '$db/franchise/game_skill_group_profile/game_skill_group_profile.model';
import {Player} from '$db/franchise/player/player.model';
import {GameSkillGroup} from '$db/franchise/game_skill_group/game_skill_group.model';
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => GameSkillGroup)
export class GameSkillGroupResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(@Root() root: GameSkillGroup): Promise<GameSkillGroupProfile> {
        if (root.profile) return root.profile;
        return this.popService.populateOneOrFail(GameSkillGroup, root, "profile");
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
