import {Injectable} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic, ScrimStatus,
} from "@sprocketbot/common";

import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimEventSubscriber {
    constructor(
        private readonly eventsService: EventsService,
        private readonly scrimCrudService: ScrimCrudService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.SubmissionStarted, false).then(obs => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            obs.subscribe(this.onSubmissionStarted);
        });
    }

    onSubmissionStarted = async (d: EventResponse<EventTopic.SubmissionStarted>): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.SubmissionStarted) return;
        const targetSubmissionId = d.payload.submissionId;
        const scrim = await this.scrimCrudService.getScrimBySubmissionId(targetSubmissionId);
        if (!scrim) return;
        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.SUBMITTING);
        scrim.status = ScrimStatus.SUBMITTING;
        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrim.id);
    };
}
