import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import type {PlayerRepository} from "$repositories";

import type {JwtAuthPayload} from "../../authentication/types";
import {JwtAuthPayloadSchema} from "../../authentication/types";

@Injectable()
export abstract class AbstractPlayerGuard implements CanActivate {
    abstract playerRepository: PlayerRepository;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const {gameId} = await this.getGame(ctx, data.data);
        const player = await this.playerRepository.getOrNull({
            where: {
                skillGroup: {gameId: gameId},
                member: {userId: data.data.userId, organizationId: data.data.currentOrganizationId},
            },
        });
        if (!player) return false;

        ctx.req.player = player;
        return true;
    }

    abstract getGame(ctx: GqlExecutionContext, userPayload: JwtAuthPayload): Promise<{gameId: number}>;
}

@Injectable()
export abstract class AbstractMemberPlayerGuard implements CanActivate {
    abstract playerRepository: PlayerRepository;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const gameAndOrganization = await this.getGameAndOrganization(ctx, data.data);
        if (!gameAndOrganization) return false;

        const {gameId, organizationId} = gameAndOrganization;
        if (data.data.currentOrganizationId !== organizationId) return false;

        const player = await this.playerRepository.getOrNull({
            where: {
                skillGroup: {gameId: gameId},
                member: {userId: data.data.userId, organizationId: organizationId},
            },
        });
        if (!player) return false;

        ctx.req.player = player;
        return true;
    }

    abstract getGameAndOrganization(
        ctx: GqlExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<{gameId: number; organizationId: number} | undefined>;
}
