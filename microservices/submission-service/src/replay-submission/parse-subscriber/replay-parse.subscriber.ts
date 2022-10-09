import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";
import type {ProgressMessage} from "@sprocketbot/common";
import {CeleryService, EventsService, EventTopic, Task} from "@sprocketbot/common";

import {getSubmissionKey} from "../../utils";
import {ReplaySubmissionService} from "../replay-submission.service";
import {ReplaySubmissionCrudService} from "../replay-submission-crud/replay-submission-crud.service";

@Injectable()
export class ReplayParseSubscriber {
    private readonly logger = new Logger(ReplayParseSubscriber.name);

    private readonly existingSubscriptions: Set<string> = new Set();

    constructor(
        private readonly celeryService: CeleryService,
        @Inject(forwardRef(() => ReplaySubmissionService))
        private readonly submissionService: ReplaySubmissionService,
        private readonly submissionCrudService: ReplaySubmissionCrudService,
        private readonly eventsService: EventsService,
    ) {}

    /**
     * Subscribes to replay parse progress updates via a submissionId returned by parseReplay.
     * @param submissionId A submissionId returned by parseReplay.
     * @returns An observable that yields replay parse progress updates.
     */
    subscribe(submissionId: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.existingSubscriptions.has(submissionId)) return;
        this.existingSubscriptions.add(submissionId);

        const observable = this.celeryService.subscribe<Task.ParseReplay>(Task.ParseReplay, submissionId);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        observable.subscribe(async (p: ProgressMessage<Task.ParseReplay>) => {
            try {
                await this.submissionCrudService.updateItemProgress(submissionId, p);

                await this.eventsService.publish(EventTopic.SubmissionProgress, {
                    submissionId: submissionId,
                    redisKey: getSubmissionKey(submissionId),
                });
                // TODO: Clean up subscription to prevent mem leak
            } catch (e) {
                this.logger.error(e);
            }
        });
    }
}
