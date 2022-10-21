import type {ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import {JwtAuthGuard} from "./jwt-auth.guard";

@Injectable()
export class GraphQLJwtAuthGuard extends JwtAuthGuard {
    getRequest(context: ExecutionContext): unknown {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}
