import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
} from "@sprocketbot/common";

import {MatchService} from "./match.service";

@Injectable()
export class MatchEventSubscriber {
    private readonly logger = new Logger(MatchEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly matchService: MatchService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.MatchSaved, false).then(obs => {
            obs.subscribe(this.onMatchSaved);
        });
    }

    onMatchSaved = (d: EventResponse<EventTopic.MatchSaved>): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.MatchSaved) return;

        this.matchService.sendReportCard(d.payload).catch(e => { this.logger.error(e) });
    };
}
