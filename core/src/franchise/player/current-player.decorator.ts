import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

import type { Player } from "../../database/franchise/player/player.model";

export const CurrentPlayer = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const player = ctx.getContext().req.player as Player | undefined;
    if (!player) throw new Error("Cannot locate Player from PlayerGuard");
    return player;
});
