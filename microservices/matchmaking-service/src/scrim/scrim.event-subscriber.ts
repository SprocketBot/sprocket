import {Injectable} from '@nestjs/common';
import {EventResponse, EventsService, EventTopic, ScrimStatus} from "@sprocketbot/common";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimEventSubscriber {
    constructor(private readonly eventsService: EventsService,
                private readonly scrimCrudService: ScrimCrudService) {
    }

    onApplicationBootstrap() {
        this.eventsService.subscribe(EventTopic.SubmissionStarted, false).then((obs) => {
            obs.subscribe(this.onSubmissionStarted)
        })
    }


    onSubmissionStarted = async (d: EventResponse<EventTopic.SubmissionStarted>) => {
        if (d.topic !== EventTopic.SubmissionStarted) return;
        const targetSubmissionId = d.payload.submissionId
        const scrim = await this.scrimCrudService.getScrimBySubmissionId(targetSubmissionId)
        if (!scrim) return;
        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.SUBMITTING)
        scrim.status = ScrimStatus.SUBMITTING
        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrim.id)

    }
}
