import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

import type {UserPayload} from "./oauth/types/userpayload.type";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user as UserPayload;
});
