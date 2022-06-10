import {
    Injectable, Logger,
} from "@nestjs/common";
import type {
    ProgressMessage,
    Task,
} from "@sprocketbot/common";
import {CeleryService, EventsService} from "@sprocketbot/common";

import {ReplaySubmissionService} from "../replay-submission.service";
import {ReplaySubmissionCrudService} from "../replay-submission-crud.service";

@Injectable()
export class ReplayParseSubscriber {
    private readonly logger = new Logger(ReplayParseSubscriber.name);

    private readonly existingSubscriptions: Set<string> = new Set();

    constructor(
        private readonly celeryService: CeleryService,
        private readonly submissionService: ReplaySubmissionService,
        private readonly submissionCrudService: ReplaySubmissionCrudService,
        private readonly eventsService: EventsService,
    ) {
    }

    // TODO: Fix this. This will be slightly more complicated because it is travsering rp -> this -> core -> client
    /**
     * Subscribes to replay parse progress updates via a submissionId returned by parseReplay.
     * @param submissionId A submissionId returned by parseReplay.
     * @returns An observable that yields replay parse progress updates.
     */
    subscribe(submissionId: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.existingSubscriptions.has(submissionId)) return;
        this.existingSubscriptions.add(submissionId);

        const observable = this.celeryService.subscribe<Task.ParseReplay>(submissionId);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        observable.subscribe(async (p: ProgressMessage<Task.ParseReplay>) => {
            await this.submissionCrudService.updateItemProgress(submissionId, p);

            const {result, ...rest} = p;

            const filename = await this.submissionCrudService.getSubmissionItems(submissionId).then(items => items.find(i => i.taskId === p.taskId)?.originalFilename);
            if (!filename) {
                this.logger.warn(`Unexpected taskId published to submission queue: ${p.taskId} in ${submissionId}`);
                return;
            }
            // TODO: Publish event, without the result?
            // eslint-disable-next-line no-console
            console.log(result, rest);

            // this.pubsub
            //     .publish(submissionId, {
            //         followReplayParse: [ {
            //             ...rest, result: null, filename: filename,
            //         } ],
            //     })
            //     .catch(this.logger.error.bind(this.logger));

        });
    }

    // TODO: Fix this, honestly, this just goes into crud?
    // async peek(submissionId: string): Promise<ReplayParseProgress[]> {
    //     return (await this.submissionService.getItems(submissionId)).map((r: ReplaySubmissionItem) => ({
    //         ...r.progress,
    //         filename: r.originalFilename,
    //     })).filter(Boolean) as ReplayParseProgress[];
    // }
}
