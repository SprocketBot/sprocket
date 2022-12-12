import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable, Logger} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {GqlExecutionContext} from "@nestjs/graphql";

import {JwtAuthPayloadSchema} from "../../authentication/types";
import {MemberRepository} from "../../organization/database/member.repository";
import {AuthorizationService} from "../authorization.service";
import {MetadataKeys} from "../authorization.types";
import type {ActionsOperator} from "../decorators/actions.decorator";

@Injectable()
export class ActionGuard implements CanActivate {
    private readonly logger = new Logger(ActionGuard.name);

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
        if (!data.success) {
            this.logger.debug({error: "Failed to parse JwtAuthPayload", data: data});
            return false;
        }

        const actionsForOrganization: string[] = [];

        // TODO: Add Sprocket/global permissions and add fetching here

        if (data.data.currentOrganizationId) {
            const member = await this.memberRepository.findOne({
                where: {userId: data.data.userId, organizationId: data.data.currentOrganizationId},
            });
            if (!member) return false;

            const memberActions = await this.authorizationService.getMemberActions(member.id);
            memberActions.forEach(ma => actionsForOrganization.push(ma));
        }

        if (!actionsForOrganization.length) return false;
        if (
            !requiredActions.some(requiredAction => {
                if (requiredAction instanceof Function) return requiredAction(actionsForOrganization);
                return actionsForOrganization.includes(requiredAction);
            })
        )
            return false;
        return true;
    }
}
