import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService,
    EventTopic,
    ResponseStatus,
    ScrimStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimEventSubscriber {
    private readonly logger = new Logger(ScrimEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly scrimCrudService: ScrimCrudService,
        private readonly scrimService: ScrimService,
        private readonly submissionService: SubmissionService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.AllSubmissionEvents, false).then(obs => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            obs.subscribe(p => {
                switch (p.topic as EventTopic) {
                    case EventTopic.SubmissionReset:
                        this.onSubmissionReset(p as EventResponse<EventTopic>).catch(
                            this.logger.error.bind(this.logger),
                        );
                        break;
                    case EventTopic.SubmissionRejectionAdded:
                        this.onSubmissionRejectionAdded(p as EventResponse<EventTopic>).catch(
                            this.logger.error.bind(this.logger),
                        );
                        break;
                    default:
                        break;
                }
            });
        });
        await this.eventsService.subscribe(EventTopic.ScrimSaved, false).then(obs => {
            obs.subscribe(this.onScrimSaved);
        });
    }

    onSubmissionReset = async (d: EventResponse<EventTopic.SubmissionReset | EventTopic>): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionReset) return;

        const {payload} = d as EventResponse<EventTopic.SubmissionReset>;
        const targetSubmissionId = payload.submissionId;
        const scrim = await this.scrimCrudService.getScrimBySubmissionId(targetSubmissionId);

        if (!scrim) return;

        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.IN_PROGRESS);
        scrim.status = ScrimStatus.IN_PROGRESS;

        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrim.id);
    };

    onSubmissionRejectionAdded = async (
        d: EventResponse<EventTopic.SubmissionRejectionAdded | EventTopic>,
    ): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionRejectionAdded) return;

        const {payload} = d as EventResponse<EventTopic.SubmissionRejectionAdded>;
        const targetSubmissionId = payload.submissionId;
        const scrim = await this.scrimCrudService.getScrimBySubmissionId(targetSubmissionId);
        const submissionResult = await this.submissionService.send(
            SubmissionEndpoint.GetSubmissionIfExists,
            targetSubmissionId,
        );
        if (submissionResult.status === ResponseStatus.ERROR) {
            this.logger.error(submissionResult.error);
            return;
        }

        if (!scrim || !submissionResult.data.submission) return;

        if (submissionResult.data.submission.rejectionStreak >= 3)
            await this.scrimService.setScrimLocked(
                scrim.id,
                true,
                "The scrim has failed ratification at least three times. Please contact support through the chat bubble.",
            );
    };

    onScrimSaved = (d: EventResponse<EventTopic.ScrimSaved | EventTopic>): void => {
        if (d.topic !== EventTopic.ScrimSaved) return;

        const {payload: scrim} = d as EventResponse<EventTopic.ScrimSaved>;
        this.scrimService.completeScrim(scrim.id).catch(e => {
            this.logger.error(e);
        });
    };
}
