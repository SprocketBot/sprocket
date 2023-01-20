import type {ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import {JwtRefreshGuard} from "./jwt-refresh.guard";

@Injectable()
export class GraphQLJwtRefreshGuard extends JwtRefreshGuard {
    getRequest(context: ExecutionContext): unknown {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}
