import {Inject, Injectable} from "@nestjs/common";
import {EventsService, EventTopic, Scrim, SprocketEvent, SprocketEventMarshal} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {PubSubKey} from "../../types/pubsub.constants";

export const ScrimsTopic = "scrims";

@Injectable()
export class ScrimPubSub extends SprocketEventMarshal {
    constructor(readonly eventsService: EventsService, @Inject(PubSubKey.Scrims) private readonly pubsub: PubSub) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.ScrimCreated, true)
    async scrimCreated(scrim: Scrim): Promise<void> {
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrim,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimCreated,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimDestroyed, true)
    async scrimDestroyed(scrim: Scrim): Promise<void> {
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrim,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimDestroyed,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimCancelled, true)
    async scrimCancelled(scrim: Scrim): Promise<void> {
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrim,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimCancelled,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimPopped, true)
    async scrimPopped(scrim: Scrim): Promise<void> {
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrim,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimPopped,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimComplete, true)
    async scrimComplete(scrim: Scrim): Promise<void> {
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrim,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimComplete,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimStarted)
    async scrimStarted(scrim: Scrim): Promise<void> {
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimStarted,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimUpdated)
    async scrimUpdated(scrim: Scrim): Promise<void> {
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrim,
                event: EventTopic.ScrimUpdated,
            },
        });
    }
}
