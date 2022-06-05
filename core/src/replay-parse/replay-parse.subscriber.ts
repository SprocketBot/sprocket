import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {ProgressMessage, Task} from "@sprocketbot/common";
import {CeleryService} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ReplayParsePubSub} from "./replay-parse.constants";
import type {ReplayParseProgress} from "./replay-parse.types";
import {ReplaySubmissionService} from "./replay-submission";
import type {ReplaySubmissionItem} from "./replay-submission/types/submission-item.types";

@Injectable()
export class ReplayParseSubscriber {
    private readonly logger = new Logger(ReplayParseSubscriber.name);

    private readonly existingSubscriptions: Set<string> = new Set();

    constructor(
        private readonly celeryService: CeleryService,
        private readonly submissionService: ReplaySubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {
    }

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
            await this.submissionService.updateItemProgress(submissionId, p);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {result, ...rest} = p;

            const filename = await this.submissionService.getItems(submissionId).then(items => items.find(i => i.taskId === p.taskId)?.originalFilename);
            if (!filename) {
                this.logger.warn(`Unexpected taskId published to submission queue: ${p.taskId} in ${submissionId}`);
                return;
            }

            this.pubsub
                .publish(submissionId, {
                    followReplayParse: [ {
                        ...rest, result: null, filename: filename,
                    } ],
                })
                .catch(this.logger.error.bind(this.logger));

        });
    }

    async peek(submissionId: string): Promise<ReplayParseProgress[]> {
        return (await this.submissionService.getItems(submissionId)).map((r: ReplaySubmissionItem) => ({
            ...r.progress,
            filename: r.originalFilename,
        })).filter(Boolean) as ReplayParseProgress[];
    }
}
