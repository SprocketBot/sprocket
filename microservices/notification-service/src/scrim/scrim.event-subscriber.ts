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
            obs.subscribe(this.onScrimPopped);
        });
        await this.eventsService.subscribe(EventTopic.ScrimComplete, false).then(obs => {
            obs.subscribe(this.onScrimComplete);
        });
    }

    onScrimPopped = (d: EventResponse<EventTopic.ScrimPopped>): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.ScrimPopped) return;

        this.scrimService.sendNotifications(d.payload).catch(e => { this.logger.error(e) });
    };

    onScrimComplete = (d: EventResponse<EventTopic.ScrimComplete>): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.ScrimComplete) return;

        this.scrimService.sendReportCard(d.payload).catch(e => { this.logger.error(e) });
    };
}
