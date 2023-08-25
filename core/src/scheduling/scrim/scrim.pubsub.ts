import {Inject, Injectable} from "@nestjs/common";
import {EventsService, EventTopic, Scrim, SprocketEvent, SprocketEventMarshal} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {PubSubKey} from "../../types/pubsub.constants";
import {convertScrimToScrimObject} from "./scrim.converter";

export const ScrimsTopic = "scrims";

@Injectable()
export class ScrimPubSub extends SprocketEventMarshal {
    constructor(readonly eventsService: EventsService, @Inject(PubSubKey.Scrims) private readonly pubsub: PubSub) {
        super(eventsService);

        pubsub.subscribe(ScrimsTopic, console.log);
    }

    @SprocketEvent(EventTopic.ScrimCreated)
    async scrimCreated(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrimObject,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimCreated,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimDestroyed)
    async scrimDestroyed(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);

        this.pubsub.publish(ScrimsTopic, {
            scrim: scrimObject,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimDestroyed,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimCancelled)
    async scrimCancelled(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);
        this.pubsub.publish(ScrimsTopic, {
            scrim: scrimObject,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimCancelled,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimPopped)
    async scrimPopped(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);

        this.pubsub.publish(ScrimsTopic, {
            scrim: scrimObject,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimPopped,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimComplete)
    async scrimComplete(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);

        this.pubsub.publish(ScrimsTopic, {
            scrim: scrimObject,
        });
        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimComplete,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimStarted)
    async scrimStarted(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);

        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimStarted,
            },
        });
    }

    @SprocketEvent(EventTopic.ScrimUpdated)
    async scrimUpdated(scrim: Scrim): Promise<void> {
        const scrimObject = convertScrimToScrimObject(scrim);

        this.pubsub.publish(scrim.id, {
            followCurrentScrim: {
                scrim: scrimObject,
                event: EventTopic.ScrimUpdated,
            },
        });
    }
}
