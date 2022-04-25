import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {ScrimPlayer} from "@sprocketbot/common";
import {
    CeleryService, MatchmakingEndpoint, MatchmakingService,
    MinioService, ProgressStatus,
    ResponseStatus, Task,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {SHA256} from "crypto-js";
import type {ReadStream} from "fs";

import {config} from "../util/config";
import {read} from "../util/read";
import {REPLAY_EXT, ReplayParsePubSub} from "./replay-parse.constants";
import type {ParseReplayResult, ParseReplaysTasks} from "./replay-parse.types";
import {ReplaySubmissionService} from "./replay-submission";

@Injectable()
export class ReplayParseService {
    private readonly logger = new Logger(ReplayParseService.name);

    constructor(
        private readonly celeryService: CeleryService,
        private readonly minioService: MinioService,
        private readonly matchmakingService: MatchmakingService,
        private readonly submissionService: ReplaySubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    /**
     * Subscribes to replay parse progress updates via a submissionId returned by parseReplay.
     * @param submissionId A submissionId returned by parseReplay.
     * @returns An observable that yields replay parse progress updates.
     */
    followReplayParse(submissionId: string): void {
        const observable = this.celeryService.subscribe(submissionId);
        observable.subscribe(p => {
            this.pubsub
                .publish(submissionId, {followReplayParse: p})
                .catch(this.logger.error.bind(this.logger));
        });
    }

    /**
     * Checks if the parsed replay is already stored in Minio. If yes, returns those stats.
     * If not, sends the replay to the replay-parse-service and waits for it to be parsed.
     * @param file The file to parse.
     * @returns The replay's stats.
     */
    async parseReplaySync(file: ReadStream): Promise<ParseReplayResult> {
        const buffer = await read(file);
        const objectHash = SHA256(buffer.toString()).toString();
        const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;

        await this.minioService.put(config.minio.bucketNames.replays, replayObjectPath, buffer);
        return this.celeryService.runSync(Task.ParseReplay, {replayObjectPath});
    }

    async parseReplays(streams: ReadStream[], submissionId: string, player: ScrimPlayer): Promise<string[]> {
        if (await this.submissionService.submissionExists(submissionId)) throw new Error(`A submission already exists for this submissionId`); // TODO under what conditions should a re-submission be allowed?

        const cantCreateReason = await this.submissionService.canCreateSubmission(submissionId, player.id);
        if (cantCreateReason) throw new Error(cantCreateReason);

        await this.submissionService.createSubmission(submissionId, player.id);

        // Keep track of taskIds to return to the client
        const taskIds: string[] = new Array<string>(streams.length);

        // Keep track of tasks from callbacks
        const tasks: ParseReplaysTasks = {};

        const promises = streams.map(async (stream, i) => {
            const buffer = await read(stream);
            const objectHash = SHA256(buffer.toString()).toString();
            const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;

            // Upload replay file to minio
            await this.minioService.put(config.minio.bucketNames.replays, replayObjectPath, buffer);

            const taskId = await this.celeryService.run(Task.ParseReplay, {replayObjectPath}, {
                progressQueue: submissionId,
                cb: async (_taskId, result, error) => {
                    // Add taskId and objectPath to submission in redis
                    await this.submissionService.addTaskId(submissionId, _taskId);
                    await this.submissionService.addObject(submissionId, replayObjectPath);

                    // When replay is finished parsing, update status
                    this.logger.debug(`Task completed taskId=${_taskId} result=${Boolean(result)} error=${error}`);
                    let status: ProgressStatus;
                    if (error) status = ProgressStatus.Error;
                    else if (result) status = ProgressStatus.Complete;
                    else throw new Error(`Task completed with neither result nor error, taskId=${_taskId}`);

                    tasks[_taskId] = {
                        status, result, error,
                    };

                    // All tasks are done when they have either completed or errored
                    const allTasksStarted = Object.keys(tasks).length === streams.length;
                    const allTasksDone = Object.values(tasks).every(t => t.status === ProgressStatus.Complete || t.status === ProgressStatus.Error);

                    // Handle completion of tasks
                    if (allTasksStarted && allTasksDone) {
                        await this.onSubmissionCompletion(tasks, submissionId, player);
                    }
                },
            });

            // Collect taskIds to return to caller
            taskIds[i] = taskId;
        });

        // Wait for all tasks to be started
        await Promise.all(promises);

        // Return taskIds, directly correspond to the files that were uploaded
        return taskIds;
    }

    private async onSubmissionCompletion(tasks: ParseReplaysTasks, submissionId: string, player: ScrimPlayer): Promise<void> {
        this.logger.debug(`Replay parse tasks complete, submissionId=${submissionId} playerId=${player.id}`);

        // Make sure all tasks completed successfully
        const allComplete = Object.values(tasks).every(t => t.status === ProgressStatus.Complete);
        if (!allComplete) {
            this.logger.error(Object.keys(tasks).map(key => `\n${key} status=${tasks[key].status} error=${tasks[key].error}`));
            return this.cleanupSubmission(submissionId, "a task failed");
        }

        // Validate replays
        const validateRes = await this.matchmakingService.send(MatchmakingEndpoint.ValidateReplays, {submissionId});

        if (validateRes.status === ResponseStatus.ERROR) {
            this.logger.error(validateRes);
            return this.cleanupSubmission(submissionId, "unexpected error");
        }

        if (!validateRes.data) {
            return this.cleanupSubmission(submissionId, "invalid");
        }

        // Passed validation, set validated=true
        this.logger.debug(`Submission passed validation submissionId=${submissionId}`);
        await this.submissionService.setValidatedTrue(submissionId);

        // Without this ESLint complains about consistent-return
        return undefined;
    }

    private async cleanupSubmission(submissionId: string, error?: string): Promise<void> {
        if (error) {
            this.logger.error(error);
        }
        // TODO what kind of error to get/report?

        // Clear submission from redis
        // Clear all parsed results from redis
        // Report error to client on pubsub
        return;
    }
}
