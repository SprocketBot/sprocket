import {Inject, Injectable} from "@nestjs/common";
import {EventsService, EventTopic, ScrimsDisabled, SprocketEvent, SprocketEventMarshal} from "@sprocketbot/common";
import {PubSub} from "graphql-subscriptions";

import {PubSubKey} from "../../../types/pubsub.constants";

export const ScrimToggleTopic = "scrim-toggle";

@Injectable()
export class ScrimTogglePubSub extends SprocketEventMarshal {
    constructor(readonly eventsService: EventsService, @Inject(PubSubKey.ScrimToggle) private readonly pubsub: PubSub) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.ScrimsDisabled, true)
    async scrimsDisabled(payload: ScrimsDisabled): Promise<void> {
        this.pubsub.publish(ScrimToggleTopic, {
            followScrimsDisabled: payload.disabled ? payload.reason ?? "" : null,
        });
    }
}
