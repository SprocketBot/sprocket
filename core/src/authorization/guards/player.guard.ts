import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import type {JwtAuthPayload} from "../../authentication/types";
import {JwtAuthPayloadSchema} from "../../authentication/types";
import type {PlayerRepository} from "../../franchise/database/player.repository";

@Injectable()
export abstract class AbstractPlayerGuard implements CanActivate {
    abstract playerRepository: PlayerRepository;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlctx = GqlExecutionContext.create(context);
        const ctx = gqlctx.getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const {gameId} = await this.getGame(gqlctx, data.data);
        const player = await this.playerRepository.findOne({
            where: {
                skillGroup: {gameId: gameId},
                member: {userId: data.data.userId, organizationId: data.data.currentOrganizationId},
            },
            relations: {
                member: {
                    profile: true,
                },
            },
        });
        if (!player) return false;

        ctx.req.player = player;
        ctx.req.member = player.member;
        return true;
    }

    abstract getGame(ctx: GqlExecutionContext, userPayload: JwtAuthPayload): Promise<{gameId: number}>;
}

export interface AbstractMemberPlayerGuardGetOptions {
    gameId: number;
    organizationId: number;
}

@Injectable()
export abstract class AbstractMemberPlayerGuard implements CanActivate {
    abstract playerRepository: PlayerRepository;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlctx = GqlExecutionContext.create(context);
        const ctx = gqlctx.getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const gameAndOrganization = await this.getGameAndOrganization(gqlctx, data.data);
        if (!gameAndOrganization) return false;

        const {gameId, organizationId} = gameAndOrganization;
        if (data.data.currentOrganizationId !== organizationId) return false;

        const player = await this.playerRepository.findOne({
            where: {
                skillGroup: {gameId: gameId},
                member: {userId: data.data.userId, organizationId: organizationId},
            },
            relations: {
                member: {
                    profile: true,
                },
            },
        });
        if (!player) return false;

        ctx.req.player = player;
        ctx.req.member = player.member;
        return true;
    }

    abstract getGameAndOrganization(
        ctx: GqlExecutionContext,
        userPayload: JwtAuthPayload,
    ): Promise<AbstractMemberPlayerGuardGetOptions | undefined>;
}
