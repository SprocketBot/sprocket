import {UseGuards} from "@nestjs/common";
import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {ScrimStatus} from "@sprocketbot/common";

import {
    GameMode, GameSkillGroup,
} from "../database";
import {GameSkillGroupService} from "../franchise";
import {GameModeService} from "../game";
import {OrGuard} from "../util/or.guard";
import {ScrimResolverPlayerGuard} from "./scrim.guard";
import type {ScrimPlayer} from "./types";
import {Scrim, ScrimLobby} from "./types";

@Resolver(() => Scrim)
export class ScrimResolver {
    constructor(
        private readonly gameSkillGroupService: GameSkillGroupService,
        private readonly gameModeService: GameModeService,
    ) {}

    @ResolveField()
    players(@Root() scrim: Scrim): undefined | ScrimPlayer[] {
        if (scrim.status === ScrimStatus.PENDING) return undefined;
        return scrim.players ?? [];
    }

    @ResolveField()
    playerCount(@Root() scrim: Scrim): number {
        return scrim.players?.length ?? 0;
    }

    @ResolveField()
    maxPlayers(@Root() scrim: Scrim): number {
        return scrim.settings.teamCount * scrim.settings.teamSize;
    }

    @ResolveField(() => ScrimLobby, {nullable: true})
    // TODO: Guard for checking if person can observe
    @UseGuards(OrGuard(ScrimResolverPlayerGuard))
    lobby(@Root() scrim: Scrim): ScrimLobby | undefined {
        return scrim.settings.lobby;
    }

    @ResolveField(() => GameMode)
    async gameMode(@Root() scrim: Scrim): Promise<GameMode> {
        return this.gameModeService.getGameModeById(scrim.gameMode.id);
    }

    @ResolveField(() => GameSkillGroup)
    async skillGroup(@Root() scrim: Scrim): Promise<GameSkillGroup> {
        return this.gameSkillGroupService.getGameSkillGroupById(scrim.skillGroupId);
    }
}
