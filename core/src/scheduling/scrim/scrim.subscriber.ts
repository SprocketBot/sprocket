import {Inject, UseGuards} from "@nestjs/common";
import {Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {PlayerService} from "../../franchise/player/player.service";
import {PubSubKey} from "../../types/pubsub.constants";
import {ScrimEvent, ScrimObject} from "../graphql/scrim.object";
import {ScrimsTopic} from "./scrim.pubsub";
import {ScrimService} from "./scrim.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimSubscriber {
    constructor(
        @Inject(PubSubKey.Scrims) private readonly pubSub: PubSub,
        private readonly playerService: PlayerService,
        private readonly scrimService: ScrimService,
    ) {}

    @Subscription(() => ScrimEvent)
    async followCurrentScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
    ): Promise<AsyncIterator<ScrimEvent> | undefined> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) return undefined;

        return this.pubSub.asyncIterator(scrim.id);
    }

    @Subscription(() => ScrimObject, {
        async filter(
            this: ScrimSubscriber,
            payload: {followPendingScrims: ScrimObject},
            variables,
            context: {req: {user: JwtAuthPayload}},
        ) {
            const {userId, currentOrganizationId} = context.req.user;
            if (!currentOrganizationId) return false;

            const {id: gameModeId} = payload.followPendingScrims.gameMode;
            const player = await this.playerService.getPlayerByOrganizationAndGameMode(
                userId,
                currentOrganizationId,
                gameModeId,
            );

            return (
                player.skillGroupId === payload.followPendingScrims.skillGroupId ||
                !payload.followPendingScrims.settings.competitive
            );
        },
    })
    async followPendingScrims(): Promise<AsyncIterator<ScrimObject>> {
        return this.pubSub.asyncIterator(ScrimsTopic);
    }
}
