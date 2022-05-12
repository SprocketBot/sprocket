import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {PlayerGuard, PlayerService} from "../franchise";
import type {GameAndOrganization} from "../franchise/player/player.types";
import {GameModeService} from "../game";
import {ScrimService} from "./scrim.service";

@Injectable()
export class JoinScrimPlayerGuard extends PlayerGuard {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly gameModeService: GameModeService,
        readonly playerService: PlayerService,
    ) { super() }

    async getGameAndOrganization(ctx: GraphQLExecutionContext): Promise<GameAndOrganization> {
        const {scrimId} = ctx.getArgs<{scrimId: string;}>();
        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        const gameMode = await this.gameModeService.getGameModeById(scrim.gameMode.id, {relations: ["game"] });

        return {
            gameId: gameMode.game.id,
            organizationId: scrim.organizationId,
        };
    }
}
