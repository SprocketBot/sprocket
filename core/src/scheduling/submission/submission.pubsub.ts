import {Inject, Injectable} from "@nestjs/common";
import {EventPayload, EventsService, EventTopic, SprocketEvent, SprocketEventMarshal} from "@sprocketbot/common";
import {PubSub} from "graphql-subscriptions";

import {PubSubKey} from "../../types/pubsub.constants";
import {SubmissionService} from "./submission.service";

export const SubmissionsTopic = "submissions";

@Injectable()
export class SubmissionPubSub extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        @Inject(PubSubKey.Submissions) private readonly pubsub: PubSub,
        private readonly submissionService: SubmissionService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.SubmissionStarted)
    async submissionStarted(payload: EventPayload<EventTopic.SubmissionStarted>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionProgress)
    async submissionProgress(payload: EventPayload<EventTopic.SubmissionProgress>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionValidating)
    async submissionValidating(payload: EventPayload<EventTopic.SubmissionValidating>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionRatifying)
    async submissionRatifying(payload: EventPayload<EventTopic.SubmissionRatifying>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionRatificationAdded)
    async submissionRatificationAdded(payload: EventPayload<EventTopic.SubmissionRatificationAdded>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionRatified)
    async submissionRatified(payload: EventPayload<EventTopic.SubmissionRatified>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionRejectionAdded)
    async submissionRejectionAdded(payload: EventPayload<EventTopic.SubmissionRejectionAdded>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionRejected)
    async submissionRejected(payload: EventPayload<EventTopic.SubmissionRejected>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }

    @SprocketEvent(EventTopic.SubmissionReset)
    async submissionReset(payload: EventPayload<EventTopic.SubmissionReset>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);
        this.pubsub.publish(payload.submissionId, {
            followSubmission: submission,
        });
    }
}
