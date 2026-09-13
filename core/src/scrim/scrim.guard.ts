import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";
import {GqlExecutionContext} from "@nestjs/graphql";
import type {Scrim} from "@sprocketbot/common";
import {GraphQLError} from "graphql";

import {PlayerGuard, PlayerService} from "../franchise";
import type {GameAndOrganization} from "../franchise/player/player.types";
import {GameModeService} from "../game";
import type {UserPayload} from "../identity/auth";
import {ScrimService} from "./scrim.service";
import type {CreateScrimInput} from "./types";

/**
 * Used on the createScrim mutation. Checks if the user attached to the request is a player of the organization the scrim is being created for.
 */
@Injectable()
export class CreateScrimPlayerGuard extends PlayerGuard {
    constructor(
        private readonly gameModeService: GameModeService,
        readonly playerService: PlayerService,
    ) {
        super();
    }

    async getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload: UserPayload,
    ): Promise<GameAndOrganization> {
        if (!userPayload.currentOrganizationId) throw new Error("User is not connected to an organization");
        const {
            data: {gameModeId},
        } = ctx.getArgs<{data: CreateScrimInput;}>();

        const gameMode = await this.gameModeService.getGameModeById(gameModeId, {
            relations: ["game"],
        });

        return {
            gameId: gameMode.game.id,
            organizationId: userPayload.currentOrganizationId,
        };
    }
}

/**
 * Used on the joinScrim mutation. Checks if the user attached to the request is a player in the correct skill group and organization.
 */
@Injectable()
export class JoinScrimPlayerGuard extends PlayerGuard {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly gameModeService: GameModeService,
        readonly playerService: PlayerService,
    ) {
        super();
    }

    async getGameAndOrganization(ctx: GraphQLExecutionContext): Promise<GameAndOrganization> {
        const {scrimId} = ctx.getArgs<{scrimId: string;}>();
        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        const gameMode = await this.gameModeService.getGameModeById(scrim.gameModeId);

        return {
            gameId: gameMode.gameId,
            organizationId: scrim.organizationId,
        };
    }
}

/**
 * In-memory scrim lobby guard.
 * Assumes that scrim.players has all needed players.
 */
@Injectable()
export class ScrimLobbyPlayerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user as UserPayload;
        if (!user.currentOrganizationId) throw new Error("User is not connected to an organization");

        const scrim = ctx.getRoot<Scrim>();
        if (!scrim.players?.some(p => p.id === user.userId)) throw new Error("Player is not in the scrim");

        return true;
    }
}
