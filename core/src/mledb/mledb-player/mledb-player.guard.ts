import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {JwtAuthPayload} from "../../authentication/types";
import {MledbPlayerService} from "./mledb-player.service";

@Injectable()
export class FormerPlayerScrimGuard implements CanActivate {
    constructor(private readonly mledbPlayerService: MledbPlayerService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as JwtAuthPayload;
        const mlePlayer = await this.mledbPlayerService.getMlePlayerBySprocketUser(payload.userId);
        if (mlePlayer.teamName === "FP") throw new GraphQLError("User is a former player in MLE");

        return true;
    }
}
