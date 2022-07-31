import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
} from "@sprocketbot/common";

import {SubmissionService} from "./submission.service";

@Injectable()
export class SubmissionEventSubscriber {
    private readonly logger = new Logger(SubmissionEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly submissionService: SubmissionService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.SubmissionRatifying, false).then(obs => {
            obs.subscribe(this.onSubmissionRatifying);
        });
    }

    onSubmissionRatifying = (d: EventResponse<EventTopic.SubmissionRatifying>): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.SubmissionRatifying) return;

        this.submissionService.sendSubmissionRatifyingNotifications(d.payload).catch(e => { this.logger.error(e) });
    };
}
