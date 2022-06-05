import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {ScrimPlayer} from "@sprocketbot/common";
import {
    CeleryService,
    config,
    EventsService,
    EventTopic,
    MatchmakingEndpoint,
    MatchmakingService,
    MinioService,
    ProgressStatus,
    ResponseStatus,
    ScrimStatus,
    Task,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {SHA256} from "crypto-js";
import {GraphQLError} from "graphql";
import type {Readable} from "stream";

import {read} from "../util/read";
import {REPLAY_EXT, ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseSubscriber} from "./replay-parse.subscriber";
import type {ParseReplaysTasks} from "./replay-parse.types";
import {ReplaySubmissionService} from "./replay-submission";

@Injectable()
export class ReplayParseService {
    private readonly logger = new Logger(ReplayParseService.name);

    constructor(
        private readonly celeryService: CeleryService,
        private readonly minioService: MinioService,
        private readonly matchmakingService: MatchmakingService,
        private readonly submissionService: ReplaySubmissionService,
        private readonly eventsService: EventsService,
        private readonly rpSubscriber: ReplayParseSubscriber,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {
    }

    /**
     *
     * @returns if the scrim has been reset
     */
    async resetBrokenReplays(submissionId: string, playerId: number): Promise<boolean> {
        const scrimResponse = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
        if (scrimResponse.status === ResponseStatus.ERROR || !scrimResponse.data) {
            if (scrimResponse.status === ResponseStatus.ERROR) this.logger.error(scrimResponse.error);
            throw new GraphQLError("Error fetching scrim");
        }
        const scrim = scrimResponse.data;

        if (scrim.status !== ScrimStatus.SUBMITTING) {
            throw new GraphQLError("You cannot reset this scrim.");
        }

        if (!scrim.players.some(player => player.id === playerId)) {
            throw new GraphQLError("You are not allowed to do this");
        }

        const submission = await this.submissionService.getSubmission(submissionId);

        if (!submission.items.some(item => item.progress?.status === ProgressStatus.Error)) {
            return false;
        }

        await Promise.all([
            this.submissionService.removeSubmission(submissionId),
            this.matchmakingService.send(MatchmakingEndpoint.ForceUpdateScrimStatus, {
                scrimId: scrim.id,
                status: ScrimStatus.IN_PROGRESS,
            }),
        ]);

        return true;
    }

    async parseReplays(streams: Array<{stream: Readable; filename: string;}>, submissionId: string, player: ScrimPlayer): Promise<string[]> {
        if (await this.submissionService.submissionExists(submissionId)) throw new Error(`A submission already exists for this submissionId`); // TODO under what conditions should a re-submission be allowed?

        const cantCreateReason = await this.submissionService.canCreateSubmission(submissionId, player.id);
        if (cantCreateReason) throw new Error(cantCreateReason);

        await this.submissionService.createSubmission(submissionId, player.id);

        // Keep track of taskIds to return to the client
        const taskIds: string[] = new Array<string>(streams.length);

        // Keep track of tasks from callbacks
        const tasks: ParseReplaysTasks = {};

        const promises = streams.map(async ({stream, filename}, i) => {
            const buffer = await read(stream);
            const objectHash = SHA256(buffer.toString()).toString();
            const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;

            // Upload replay file to minio
            await this.minioService.put(config.minio.bucketNames.replays, replayObjectPath, buffer);
            // watch the submission
            this.rpSubscriber.subscribe(submissionId);
            const taskId = await this.celeryService.run(Task.ParseReplay, {replayObjectPath}, {
                progressQueue: submissionId,
                cb: async (_taskId, result, error) => {
                    // When replay is finished parsing, update status
                    this.logger.debug(`Task completed taskId=${_taskId} result=${Boolean(result)} error=${error}`);
                    let status: ProgressStatus;
                    if (error) status = ProgressStatus.Error;
                    else if (result) status = ProgressStatus.Complete;
                    else throw new Error(`Task completed with neither result nor error, taskId=${_taskId}`);
                    // Save information about parsed replay on the submission
                    await this.submissionService.upsertItem(submissionId, {
                        originalFilename: filename,
                        taskId: _taskId,
                        inputPath: replayObjectPath,
                        outputPath: result?.outputPath,
                    });

                    tasks[_taskId] = {
                        status, result, error,
                    };

                    // All tasks are done when they have either completed or errored
                    const allTasksStarted = Object.keys(tasks).length === streams.length;
                    const allTasksDone = Object.values(tasks).every(t => t.status === ProgressStatus.Complete || t.status === ProgressStatus.Error);

                    // Handle completion of tasks
                    if (allTasksStarted && allTasksDone) {
                        await this.onParseCompletion(tasks, submissionId, player);
                    }
                },
            });

            await this.submissionService.upsertItem(submissionId, {
                originalFilename: filename,
                taskId: taskId,
                inputPath: replayObjectPath,
                progress: {
                    taskId: taskId,
                    status: ProgressStatus.Pending,
                    progress: {
                        value: 0,
                        message: "starting",
                    },
                    result: null,
                    error: null,
                },
            });

            // Collect taskIds to return to caller
            taskIds[i] = taskId;
        });

        // Wait for all tasks to be started
        await Promise.all(promises);

        await this.eventsService.publish(EventTopic.SubmissionStarted, {submissionId: submissionId});

        // Return taskIds, directly correspond to the files that were uploaded
        return taskIds;
    }

    private async onParseCompletion(tasks: ParseReplaysTasks, submissionId: string, player: ScrimPlayer): Promise<void> {
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

        // End submission so that players can ratify the submission
        await this.submissionService.endSubmission(submissionId, player);

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
