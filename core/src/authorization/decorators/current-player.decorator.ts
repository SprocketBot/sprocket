import type {ExecutionContext} from "@nestjs/common";
import {createParamDecorator, Logger} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import type {Player} from "../../franchise/database/player.entity";

const logger = new Logger("CurrentPlayerDecorator");

export const CurrentPlayer = createParamDecorator((data: unknown, context: ExecutionContext): Player => {
    const ctx = GqlExecutionContext.create(context);
    const player = ctx.getContext().req.player as Player | undefined;

    if (!player) {
        logger.error("CurrentPlayer decorator used without Player Guard");
        throw new GraphQLError("Internal Server Error");
    }

    return player;
});
