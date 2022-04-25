import type {ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class GqlJwtGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext): unknown {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}
