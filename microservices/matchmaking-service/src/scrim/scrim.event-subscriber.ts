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
                    case EventTopic.SubmissionStarted:
                        this.onSubmissionStarted(p as unknown as EventResponse<EventTopic.SubmissionStarted>).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.SubmissionReset:
                        this.onSubmissionReset(p as EventResponse<EventTopic>).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.SubmissionComplete:
                        this.onSubmissionComplete(p as EventResponse<EventTopic>).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.SubmissionRatified:
                        this.onSubmissionRatified(p as EventResponse<EventTopic>).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.SubmissionRejected:
                        this.onSubmissionRejected(p as EventResponse<EventTopic>).catch(this.logger.error.bind(this.logger));
                        break;
                    default:
                        break;
                }
            });
        });

    }

    onSubmissionStarted = async (d: EventResponse<EventTopic.SubmissionStarted | EventTopic>): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionStarted) return;
        const {payload} = d as EventResponse<EventTopic.SubmissionStarted>;
        const targetSubmissionId = payload.submissionId;
        const scrim = await this.scrimCrudService.getScrimBySubmissionId(targetSubmissionId);
        if (!scrim) return;
        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.SUBMITTING);
        scrim.status = ScrimStatus.SUBMITTING;
        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrim.id);
    };

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

    onSubmissionComplete = async (d: EventResponse<EventTopic.SubmissionComplete | EventTopic>): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionComplete) return;
        const {payload} = d as EventResponse<EventTopic.SubmissionComplete>;

        const scrim = await this.scrimCrudService.getScrimBySubmissionId(payload.submissionId);
        if (!scrim) {
            this.logger.warn(`Scrim not found for submission ${payload.submissionId}`);
            return;
        }
        await this.scrimService.moveToRatification(scrim.id);
    };

    onSubmissionRatified = async (d: EventResponse<EventTopic.SubmissionRatified | EventTopic>): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionRatified) return;
        const {payload} = d as EventResponse<EventTopic.SubmissionRatified>;

        const scrim = await this.scrimCrudService.getScrimBySubmissionId(payload.submissionId);
        if (!scrim) {
            this.logger.warn(`Scrim not found for submission ${payload.submissionId}`);
            return;
        }
        await this.scrimService.completeScrim(scrim.id);
    };

    onSubmissionRejected = async (d: EventResponse<EventTopic.SubmissionRejected | EventTopic>): Promise<void> => {
        if (d.topic !== EventTopic.SubmissionRejected) return;
        const {payload} = d as EventResponse<EventTopic.SubmissionRejected>;

        const scrim = await this.scrimCrudService.getScrimBySubmissionId(payload.submissionId);
        if (!scrim) {
            this.logger.warn(`Scrim not found for submission ${payload.submissionId}`);
            return;
        }
        await this.scrimService.resetScrim(scrim.id).catch(e => { this.logger.error(e) });

        const submissionResult = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRejections, {submissionId: payload.submissionId});
        if (submissionResult.status === ResponseStatus.ERROR) throw submissionResult.error;

        if (submissionResult.data.length >= 3) await this.scrimService.setScrimLocked(scrim.id, true);
    };
}
