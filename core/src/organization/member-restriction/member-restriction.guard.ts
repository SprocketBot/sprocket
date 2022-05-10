import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";
import {IsNull, MoreThan} from "typeorm";

import {MemberRestrictionType} from "../../database";
import type {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";
import {MemberService} from "../member/member.service";
import {MemberRestrictionService} from "./member-restriction.service";

@Injectable()
export abstract class MemberRestrictionGuard implements CanActivate {
    abstract readonly type: MemberRestrictionType;

    abstract readonly failureResponse: string;

    constructor(private readonly memberRestrictionService: MemberRestrictionService, private readonly memberService: MemberService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;

        const member = await this.memberService.getMember({
            where: {user: {id: payload.userId}, organization: {id: payload.currentOrganizationId} },
        }).catch(() => null);
        if (!member) throw new GraphQLError("User is not a member of the organization");

        const restrictions = await this.memberRestrictionService.getMemberRestrictions({
            where: [
                {
                    type: this.type,
                    expiration: MoreThan(new Date()),
                    manualExpiration: IsNull(),
                    member: {id: member.id},
                },
                {
                    type: this.type,
                    manualExpiration: MoreThan(new Date()),
                    member: {id: member.id},
                },
            ],
        });

        if (restrictions.length) {
            throw new GraphQLError(this.failureResponse);
        }
        
        return true;
    }
}

export class QueueBanGuard extends MemberRestrictionGuard {
    readonly type: MemberRestrictionType = MemberRestrictionType.QUEUE_BAN;

    readonly failureResponse = "You're queue banned until you're not...sorry.";
}
