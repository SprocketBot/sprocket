import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../../database/mledb/enums/OrganizationTeam.enum";
import type {UserPayload} from "../../identity";

@Injectable()
export abstract class MLEOrganizationTeamGuard implements CanActivate {
    abstract readonly organizationTeam: MLE_OrganizationTeam;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;

        return Boolean(payload.orgTeams?.includes(this.organizationTeam));
    }
}

export class MLEDeveloperTeamGuard extends MLEOrganizationTeamGuard {
    readonly organizationTeam = MLE_OrganizationTeam.MLEDB_ADMIN;
}
