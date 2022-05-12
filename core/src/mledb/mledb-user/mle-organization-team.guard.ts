import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import {OrganizationTeam} from "../../database/mledb/enums/OrganizationTeam.enum";
import type {UserPayload} from "../../identity";
import {MledbUserService} from "./mledb-user.service";

@Injectable()
export abstract class MLEOrganizationTeamGuard implements CanActivate {
    abstract readonly organizationTeam: OrganizationTeam;

    constructor(private readonly mledbUserService: MledbUserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;

        return false;
    }
}

export class MLEDeveloperTeamGuard extends MLEOrganizationTeamGuard {
    readonly organizationTeam = OrganizationTeam.YES;
}
