import {UseGuards} from "@nestjs/common";
import {
    Int,
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {ScrimStatus} from "@sprocketbot/common";

import {GameMode, GameSkillGroup} from "../database";
import {MLE_OrganizationTeam} from "../database/mledb";
import {GameSkillGroupService} from "../franchise";
import {GameModeService} from "../game";
import {CurrentUser, UserPayload} from "../identity";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {OrGuard} from "../util/or.guard";
import {ScrimResolverPlayerGuard} from "./scrim.guard";
import type {ScrimGroup} from "./types";
import {Scrim, ScrimLobby, ScrimPlayer} from "./types";

@Resolver(() => Scrim)
export class ScrimResolver {
    constructor(
        private readonly gameSkillGroupService: GameSkillGroupService,
        private readonly gameModeService: GameModeService,
    ) {}

    @ResolveField(() => GameMode)
    async gameMode(@Root() scrim: Partial<Scrim>): Promise<GameMode> {
        return scrim.gameMode ?? this.gameModeService.getGameModeById(scrim.gameModeId!);
    }

    @ResolveField(() => GameSkillGroup)
    async skillGroup(@Root() scrim: Partial<Scrim>): Promise<GameSkillGroup> {
        return scrim.skillGroup ?? this.gameSkillGroupService.getGameSkillGroupById(scrim.skillGroupId!);
    }

    @ResolveField(() => [ScrimPlayer], {nullable: true})
    players(@Root() scrim: Scrim): undefined | ScrimPlayer[] {
        if (scrim.status === ScrimStatus.PENDING) return undefined;
        return scrim.players ?? [];
    }

    @ResolveField(() => [ScrimPlayer])
    @UseGuards(
        GqlJwtGuard,
        MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN),
    )
    playersAdmin(@Root() scrim: Scrim): undefined | ScrimPlayer[] {
        return scrim.players ?? [];
    }

    @ResolveField(() => ScrimLobby, {nullable: true})
    // TODO: Guard for checking if person can observe
    @UseGuards(OrGuard(ScrimResolverPlayerGuard))
    lobby(@Root() scrim: Scrim): ScrimLobby | undefined {
        return scrim.lobby;
    }

    @ResolveField(() => String, {nullable: true})
    currentGroup(
        @Root() scrim: Scrim,
        @CurrentUser() user: UserPayload,
    ): ScrimGroup | undefined {
        const code = scrim.players?.find(p => p.id === user.userId)?.group;
        if (!code) return undefined;
        return {
            code: code,
            players: scrim.players.filter(p => p.group === code && p.id !== user.userId).map(p => p.name),
        };
    }

    @ResolveField(() => Int)
    playerCount(@Root() scrim: Scrim): number {
        return scrim.players?.length ?? 0;
    }

    @ResolveField(() => Int)
    maxPlayers(@Root() scrim: Scrim): number {
        return scrim.settings.teamCount * scrim.settings.teamSize;
    }
}
