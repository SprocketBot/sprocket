import {Inject, Logger, UseGuards} from "@nestjs/common";
import {Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "graphql-subscriptions";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import type {JwtAuthPayload} from "../../authentication/types";
import {PlayerService} from "../../franchise/player/player.service";
import {PubSubKey} from "../../types/pubsub.constants";
import {ScrimEvent, ScrimObject} from "../graphql/scrim/scrim.object";
import {ScrimsTopic} from "./scrim.pubsub";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimSubscriptionsResolver {
    private readonly logger = new Logger(ScrimSubscriptionsResolver.name);

    constructor(
        @Inject(PubSubKey.Scrims) private readonly pubSub: PubSub,
        private readonly playerService: PlayerService,
    ) {}

    @Subscription(() => ScrimEvent, {
        resolve(p) {
            return p.scrim;
        },
        async filter(
            this: ScrimSubscriptionsResolver,
            _payload: {scrim: ScrimObject},
            _variables,
            _context: {req: {user: JwtAuthPayload}},
        ) {
            return true;
        },
    })
    async followCurrentScrim(): Promise<AsyncIterator<ScrimEvent> | undefined> {
        return this.pubSub.asyncIterator(ScrimsTopic);
    }

    @Subscription(() => ScrimObject, {
        resolve(p) {
            return p.scrim;
        },
        async filter(
            this: ScrimSubscriptionsResolver,
            payload: {scrim: ScrimObject},
            variables,
            context: {req: {user: JwtAuthPayload}},
        ) {
            const {userId, currentOrganizationId} = context.req.user;
            if (!currentOrganizationId) return false;
            const player = await this.playerService
                .getPlayerByOrganizationAndGameMode(userId, currentOrganizationId, payload.scrim.gameModeId)
                .catch(this.logger.error.bind(this.logger));
            if (!player) return false;

            return player.skillGroupId === payload.scrim.skillGroupId || !payload.scrim.settings.competitive;
        },
    })
    async followPendingScrims(): Promise<AsyncIterator<ScrimObject>> {
        return this.pubSub.asyncIterator(ScrimsTopic);
    }
}
