import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import type {GraphQLExecutionContext} from "@nestjs/graphql";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {UserPayload} from "../../identity";
import type {PlayerService} from "./player.service";
import type {GameAndOrganization} from "./player.types";

@Injectable()
export abstract class PlayerGuard implements CanActivate {
    abstract playerService: PlayerService;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;
        const {gameId, organizationId} = await this.getGameAndOrganization(ctx, payload);
        const player = await this.playerService
            .getPlayerByOrganizationAndGame(payload.userId, organizationId, gameId)
            .catch(() => null);

        if (!player) throw new GraphQLError(`User is not a player for organization=${organizationId} and game=${gameId}`);
        ctx.getContext().req.player = player;

        return true;
    }

    abstract getGameAndOrganization(
        ctx: GraphQLExecutionContext,
        userPayload?: UserPayload,
    ): Promise<GameAndOrganization>;
}
