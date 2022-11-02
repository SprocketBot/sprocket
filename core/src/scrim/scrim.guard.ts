import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";
import type {Scrim} from "@sprocketbot/common";
import {GraphQLError} from "graphql";

import {GameModeRepository, PlayerRepository} from "$repositories";

import type {JwtAuthPayload} from "../authentication/types";
import {PlayerGuard} from "../franchise";
import type {GameAndOrganization} from "../franchise/player/player.types";
import {ScrimService} from "./scrim.service";
import type {CreateScrimInput} from "./types";

/**
 * Used on the createScrim mutation. Checks if the user attached to the request is a player of the organization the scrim is being created for.
 */
@Injectable()
export class CreateScrimPlayerGuard extends PlayerGuard {
    constructor(private readonly gameModeRepository: GameModeRepository, readonly playerRepository: PlayerRepository) {
        super();
    }

    async getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<GameAndOrganization> {
        if (!userPayload.currentOrganizationId) throw new Error("User is not connected to an organization");
        const {
            data: {gameModeId},
        } = ctx.getArgs<{data: CreateScrimInput}>();

        const gameMode = await this.gameModeRepository.getById(gameModeId, {relations: ["game"]});

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
        private readonly gameModeRepository: GameModeRepository,
        readonly playerRepository: PlayerRepository,
    ) {
        super();
    }

    async getGameAndOrganization(ctx: GraphQLExecutionContext): Promise<GameAndOrganization> {
        const {scrimId} = ctx.getArgs<{scrimId: string}>();
        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        const gameMode = await this.gameModeRepository.getById(scrim.gameModeId);

        return {
            gameId: gameMode.gameId,
            organizationId: scrim.organizationId,
        };
    }
}

/**
 * Used on the field resolvers in the scrim resolver. Checks if the user attached to the request is a player in the scrim.
 */
@Injectable()
export class ScrimResolverPlayerGuard extends PlayerGuard {
    constructor(private readonly gameModeRepository: GameModeRepository, readonly playerRepository: PlayerRepository) {
        super();
    }

    async getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<GameAndOrganization> {
        if (!userPayload.currentOrganizationId) throw new Error("User is not connected to an organization");

        const scrim = ctx.getRoot<Scrim>();
        const gameMode = await this.gameModeRepository.getById(scrim.gameModeId);

        if (!scrim.players.some(p => p.id === userPayload.userId)) throw new Error("Player is not in the scrim");

        return {
            gameId: gameMode.gameId,
            organizationId: scrim.organizationId,
        };
    }
}
