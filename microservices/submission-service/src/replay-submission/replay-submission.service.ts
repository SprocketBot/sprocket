import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import type {ReplayParseTask, ReplaySubmission} from "@sprocketbot/common";
import {
    CeleryService,
    EventsService,
    EventTopic,
    MinioService,
    Precondition,
    ProgressStatus,
    ReplaySubmissionStatus,
    Task,
} from "@sprocketbot/common";

import {ReplayValidationService} from "../replay-validation/replay-validation.service";
import {getSubmissionKey} from "../utils";
import {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionCrudService} from "./replay-submission-crud/replay-submission-crud.service";
import {ReplaySubmissionRatificationService} from "./replay-submission-ratification";
import {StatsConverterService} from "./stats-converter/stats-converter.service";

@Injectable()
export class ReplaySubmissionService {
    private readonly logger = new Logger(ReplaySubmissionService.name);

    constructor(
        private readonly submissionCrudService: ReplaySubmissionCrudService,
        private readonly minioService: MinioService,
        private readonly celeryService: CeleryService,
        private readonly eventsService: EventsService,
        @Inject(forwardRef(() => ReplayParseSubscriber))
        private readonly replayParseSubscriber: ReplayParseSubscriber,
        private readonly replayValidationService: ReplayValidationService,
        private readonly ratificationService: ReplaySubmissionRatificationService,
        private readonly statsConverterService: StatsConverterService,
    ) {}

    /**
     * @param filePaths {string[]} Array of keys in minio/s3 that contains the replays
     * @param submissionId {string} Pre-generated Id assigned for this submission
     */
    async beginSubmission(filePaths: Array<{minioPath: string; originalFilename: string;}>, submissionId: string, creatorId: number): Promise<string[]> {
        await this.submissionCrudService.getOrCreateSubmission(submissionId, creatorId);
        const tasks: ReplayParseTask[] = [];
        // Subscribe before doing anything to ensure that we don't drop events
        this.replayParseSubscriber.subscribe(submissionId);
        await this.submissionCrudService.updateStatus(submissionId, ReplaySubmissionStatus.PROCESSING);
        const celeryPromises = filePaths.map(async fp => {
            const precondition = new Precondition();

            // Create the Celery Task
            const taskId = await this.celeryService.run(Task.ParseReplay, {replayObjectPath: fp.minioPath}, {
                progressQueue: submissionId,
                cb: async (_taskId, result, error) => {
                    await precondition.promise;
                    const item = (await this.submissionCrudService.getSubmissionItems(submissionId)).find(i => i.taskId === _taskId);
                    if (!item) {
                        this.logger.error(`Got taskId '${_taskId}' with no matching item for submissionId '${submissionId}'`);
                        return;
                    }
                    if (!result && !error) {
                        this.logger.error(`Unexpected state, no result or error returned from Replay Parse Service`);
                        return;
                    }
                    if (error) {
                        // Handle error case.
                        this.logger.warn(`Replay submission failed! ${error.message}`, error.stack);
                        item.progress!.status = ProgressStatus.Error;
                        item.progress!.progress = {
                            message: "Parsing Failed",
                            value: 100,
                        };
                    } else {
                        item.progress = {
                            status: ProgressStatus.Complete,
                            taskId: _taskId,
                            result: result,
                            progress: {
                                message: "Complete!",
                                value: 100,
                            },
                            error: null,
                        };
                        item.outputPath = result!.outputPath;
                    }
                    await this.submissionCrudService.upsertItem(submissionId, item);
                    tasks.push({
                        status: item.progress!.status,
                        result: item.progress!.result,
                        error: null,
                        taskId: item.taskId,
                    });
                    if (tasks.length === filePaths.length && tasks.every(t => [ProgressStatus.Complete, ProgressStatus.Error].includes(t.status))) {
                        // We do be kinda done though.
                        const submission = await this.submissionCrudService.getSubmission(submissionId);
                        if (!submission) throw new Error("Submission is done, but also does not exist?");
                        await this.completeSubmission(submission, submissionId);
                    }
                },
            });
            await this.submissionCrudService.upsertItem(submissionId, {
                originalFilename: fp.originalFilename,
                taskId: taskId,
                inputPath: fp.minioPath,
                progress: {
                    taskId: taskId,
                    status: ProgressStatus.Pending,
                    progress: {
                        value: 0,
                        message: "Queued for Parsing",
                    },
                    result: null,
                    error: null,
                },
            });

            precondition.resolve();
        });

        await Promise.all(celeryPromises);
        await this.eventsService.publish(EventTopic.SubmissionStarted, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });
        return tasks.map(t => t.taskId);

    }

    async completeSubmission(submission: ReplaySubmission, submissionId: string): Promise<void> {
        if (!submission.items.every(item => [ProgressStatus.Complete, ProgressStatus.Error].includes(item.progress?.status ?? ProgressStatus.Pending))) {
            throw new Error("Submission not yet ready for completion");
        }

        submission.rejections.forEach(r => { r.stale = true });

        await this.submissionCrudService.expireRejections(submissionId);
        await this.submissionCrudService.updateStatus(submissionId, ReplaySubmissionStatus.VALIDATING);

        await this.eventsService.publish(EventTopic.SubmissionValidating, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });

        const valid = await this.replayValidationService.validate(submission);
        if (!valid.valid) {
            await this.submissionCrudService.updateStatus(submissionId, ReplaySubmissionStatus.REJECTED);
            await this.ratificationService.rejectSubmission("system", submissionId, JSON.stringify(valid.errors, null, 2));
            return;
        }

        await this.submissionCrudService.setValidatedTrue(submissionId);
        await this.submissionCrudService.updateStatus(submissionId, ReplaySubmissionStatus.RATIFYING);

        submission.stats = this.statsConverterService.convertStats(submission.items.map(item => item.progress!.result!));
        await this.submissionCrudService.setStats(submissionId, submission.stats);

        await this.eventsService.publish(EventTopic.SubmissionRatifying, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
            resultPaths: submission.items.map(item => item.outputPath!),
        });
        // TODO: Expose endpoint to remove submission.
    }
}
