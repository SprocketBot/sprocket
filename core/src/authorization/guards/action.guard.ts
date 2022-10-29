import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {GqlExecutionContext} from "@nestjs/graphql";

import {MemberRepository} from "$repositories";

import {JwtAuthPayloadSchema} from "../../authentication/types";
import {AuthorizationService} from "../authorization.service";
import {MetadataKeys} from "../authorization.types";
import type {ActionsOperator} from "../decorators/actions.decorator";

@Injectable()
export class ActionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService,
        private readonly memberRepository: MemberRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredActions = this.reflector.getAllAndOverride<Array<string | ActionsOperator> | undefined>(
            MetadataKeys.Actions,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredActions?.length) return true;

        const ctx = GqlExecutionContext.create(context).getContext();
        if (!ctx?.req.user) return false;

        const data = JwtAuthPayloadSchema.safeParse(ctx.req.user);
        if (!data.success || !data.data.currentOrganizationId) return false;

        const member = await this.memberRepository.getOrNull({
            where: {userId: data.data.userId, organizationId: data.data.currentOrganizationId},
        });
        if (!member) return false;

        const memberActions = await this.authorizationService.getMemberActions(member.id);
        if (
            !requiredActions.some(requiredAction => {
                if (requiredAction instanceof Function) return requiredAction(memberActions);
                return memberActions.includes(requiredAction);
            })
        )
            return false;
        return true;
    }
}
