import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

export const AuthenticatedUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
});
