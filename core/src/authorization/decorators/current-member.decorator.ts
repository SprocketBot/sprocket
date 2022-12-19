import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator, Logger} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {Member} from "../../organization/database/member.entity";

const logger = new Logger("CurrentMemberDecorator");

export const CurrentMember = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const member = ctx.getContext().req.member as Member | undefined;

    if (!member) {
        logger.error("CurrentMember decorator used without Member Guard");
        throw new GraphQLError("Internal Server Error");
    }

    return member;
});
