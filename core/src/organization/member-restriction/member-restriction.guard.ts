import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {MemberRepository, MemberRestrictionRepository} from "$repositories";
import {MemberRestrictionType} from "$types";

import type {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";

@Injectable()
export abstract class MemberRestrictionGuard implements CanActivate {
    abstract readonly restrictionType: MemberRestrictionType;

    abstract readonly failureResponse: string;

    constructor(
        private readonly memberRestrictionRepository: MemberRestrictionRepository,
        private readonly memberRepository: MemberRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;

        const member = await this.memberRepository
            .get({
                where: {
                    user: {id: payload.userId},
                    organization: {id: payload.currentOrganizationId},
                },
            })
            .catch(() => null);
        if (!member) throw new GraphQLError("User is not a member of the organization");

        const restrictions = await this.memberRestrictionRepository.getActiveRestrictions(
            this.restrictionType,
            new Date(),
            member.id,
        );

        if (restrictions.length) throw new GraphQLError(this.failureResponse);

        return true;
    }
}

export class QueueBanGuard extends MemberRestrictionGuard {
    readonly restrictionType: MemberRestrictionType = MemberRestrictionType.QUEUE_BAN;

    readonly failureResponse = "You are currently queue banned";
}

export class RatificationBanGuard extends MemberRestrictionGuard {
    readonly restrictionType: MemberRestrictionType = MemberRestrictionType.RATIFICATION_BAN;

    readonly failureResponse = "You have been banned from ratifying or rejecting ratification of scrims.";
}
