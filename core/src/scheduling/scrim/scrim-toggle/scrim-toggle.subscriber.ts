import {Inject, UseGuards} from "@nestjs/common";
import {Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "graphql-subscriptions";

import {GraphQLJwtAuthGuard} from "../../../authentication/guards";
import {PubSubKey} from "../../../types/pubsub.constants";
import {ScrimToggleTopic} from "./scrim-toggle.pubsub";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimToggleSubscriber {
    constructor(@Inject(PubSubKey.ScrimToggle) private readonly pubSub: PubSub) {}

    @Subscription(() => String, {nullable: true})
    async followScrimsDisabled(): Promise<AsyncIterator<string | undefined>> {
        return this.pubSub.asyncIterator(ScrimToggleTopic);
    }
}
