import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";

@Injectable()
export class ScrimEventSubscriber {
    private readonly logger = new Logger(ScrimEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly scrimService: ScrimService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.ScrimPopped, false).then(obs => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            obs.subscribe(this.onScrimPopped);
        });
    }

    onScrimPopped = async (d: EventResponse<EventTopic.ScrimPopped>): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.ScrimPopped) return;

        await this.scrimService.sendNotifications(d.payload);
    };
}
