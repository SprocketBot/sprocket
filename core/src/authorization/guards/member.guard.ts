import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import type {JwtAuthPayload} from "../../authentication/types";
import { JwtAuthPayloadSchema} from "../../authentication/types";
import {MemberRepository} from "../../organization/database/member.repository";

@Injectable()
export class MemberGuard implements CanActivate {
    constructor(private readonly memberRepository: MemberRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const member = await this.memberRepository.findOne({
            where: {userId: data.data.userId, organizationId: data.data.currentOrganizationId},
        });
        if (!member) return false;

        ctx.req.member = member;
        return true;
    }
}

@Injectable()
export abstract class AbstractMemberGuard implements CanActivate {
    abstract memberRepository: MemberRepository;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const {organizationId} = await this.getOrganization(ctx, data.data);
        if (data.data.currentOrganizationId !== organizationId) return false;

        const member = await this.memberRepository.findOne({
            where: {userId: data.data.userId, organizationId: organizationId},
        });
        if (!member) return false;

        ctx.req.member = member;
        return true;
    }

    abstract getOrganization(ctx: GqlExecutionContext, userPayload?: JwtAuthPayload): Promise<{organizationId: number}>;
}
