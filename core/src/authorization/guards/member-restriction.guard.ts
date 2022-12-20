import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {JwtAuthPayload} from "../../authentication/types";
import {MemberRepository} from "../../organization/database/member.repository";
import {MemberRestrictionRepository} from "../../organization/database/member-restriction.repository";
import {MemberRestrictionType} from "../../organization/database/member-restriction-type.enum";

@Injectable()
export abstract class AbstractMemberRestrictionGuard implements CanActivate {
    abstract readonly restrictionType: MemberRestrictionType;

    abstract readonly failureResponse: string;

    constructor(
        private readonly memberRestrictionRepository: MemberRestrictionRepository,
        private readonly memberRepository: MemberRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as JwtAuthPayload;

        const member = await this.memberRepository.findOne({
            where: {
                user: {id: payload.userId},
                organization: {id: payload.currentOrganizationId},
            },
        });
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

export class QueueBanGuard extends AbstractMemberRestrictionGuard {
    readonly restrictionType: MemberRestrictionType = MemberRestrictionType.QUEUE_BAN;

    readonly failureResponse = "You are currently queue banned";
}

export class RatificationBanGuard extends AbstractMemberRestrictionGuard {
    readonly restrictionType: MemberRestrictionType = MemberRestrictionType.RATIFICATION_BAN;

    readonly failureResponse = "You have been banned from ratifying or rejecting ratification of scrims.";
}
