import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import type {UserPayload} from "./oauth";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user as UserPayload;
});
