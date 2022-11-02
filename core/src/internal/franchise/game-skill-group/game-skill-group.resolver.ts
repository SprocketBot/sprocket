import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {Game, GameSkillGroupProfile, Player} from "$models";
import {GameSkillGroup} from "$models";

import {PopulateService} from "../../../util/populate/populate.service";

@Resolver(() => GameSkillGroup)
export class GameSkillGroupResolver {
    constructor(private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(@Root() skillGroup: Partial<GameSkillGroup>): Promise<GameSkillGroupProfile> {
        return (
            skillGroup.profile ??
            this.popService.populateOneOrFail(GameSkillGroup, skillGroup as GameSkillGroup, "profile")
        );
    }

    @ResolveField()
    async game(@Root() skillGroup: Partial<GameSkillGroup>): Promise<Game> {
        return (
            skillGroup.game ?? this.popService.populateOneOrFail(GameSkillGroup, skillGroup as GameSkillGroup, "game")
        );
    }

    @ResolveField()
    async players(@Root() skillGroup: Partial<GameSkillGroup>): Promise<Player[]> {
        return (
            skillGroup.players ?? this.popService.populateMany(GameSkillGroup, skillGroup as GameSkillGroup, "players")
        );
    }
}
