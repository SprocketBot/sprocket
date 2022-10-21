import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {CoreEndpoint, CoreInput} from "@sprocketbot/common";
import {
    config,
    EventsService,
    EventTopic,
    MinioService,
    readToBuffer,
    RedisService,
    REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {SHA256} from "crypto-js";
import {GraphQLError} from "graphql";
import type {Readable} from "stream";
import {DataSource} from "typeorm";

import {REPLAY_EXT, ReplayParsePubSub} from "./replay-parse.constants";
import type {ReplaySubmission} from "./types";

@Injectable()
export class ReplayParseService {
    private readonly logger = new Logger(ReplayParseService.name);

    private subscribed: boolean = false;

    constructor(
        private readonly minioService: MinioService,
        private readonly submissionService: SubmissionService,
        private readonly redisService: RedisService,
        private readonly eventsService: EventsService,
        private readonly dataSource: DataSource,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    async getSubmission(submissionId: string): Promise<ReplaySubmission> {
        const result = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (result.status === ResponseStatus.ERROR) throw result.error;

        // Right now, this is entirely based on faith. If we encounter issues; we can update the graphql types.
        // Writing up a zod schema set for this would be suckage to the 10th degree.
        return this.redisService.getJson<ReplaySubmission>(result.data.redisKey);
    }

    /**
     * @returns if the scrim has been reset
     */
    async resetBrokenReplays(submissionId: string, playerId: number, override = false): Promise<boolean> {
        const resetResponse = await this.submissionService.send(SubmissionEndpoint.ResetSubmission, {
            submissionId: submissionId,
            override: override,
            playerId: playerId.toString(),
        });
        if (resetResponse.status === ResponseStatus.ERROR) throw resetResponse.error;
        return true;
    }

    async parseReplays(streams: Array<{stream: Readable; filename: string;}>, submissionId: string, playerId: number): Promise<string[]> {
        const canSubmitReponse = await this.submissionService.send(SubmissionEndpoint.CanSubmitReplays, {
            playerId: playerId,
            submissionId: submissionId,
        });
        if (canSubmitReponse.status === ResponseStatus.ERROR) throw canSubmitReponse.error;
        if (!canSubmitReponse.data.canSubmit) throw new GraphQLError(canSubmitReponse.data.reason);

        const filepaths = await Promise.all(streams.map(async s => {
            const buffer = await readToBuffer(s.stream);
            const objectHash = SHA256(buffer.toString()).toString();
            const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;
            const bucket = config.minio.bucketNames.replays;
            await this.minioService.put(bucket, replayObjectPath, buffer).catch(this.logger.error.bind(this));

            return {
                minioPath: replayObjectPath,
                originalFilename: s.filename,
            };
        }));

        const submissionResponse = await this.submissionService.send(SubmissionEndpoint.SubmitReplays, {
            submissionId: submissionId,
            filepaths: filepaths,
            creatorId: playerId,
        });
        if (submissionResponse.status === ResponseStatus.ERROR) throw submissionResponse.error;
        // Return taskIds, directly correspond to the files that were uploaded
        return submissionResponse.data;
    }

    async ratifySubmission(submissionId: string, playerId: number): Promise<void> {
        const canRatifyReponse = await this.submissionService.send(SubmissionEndpoint.CanRatifySubmission, {
            playerId: playerId,
            submissionId: submissionId,
        });
        if (canRatifyReponse.status === ResponseStatus.ERROR) throw canRatifyReponse.error;
        if (!canRatifyReponse.data.canRatify) throw new GraphQLError(canRatifyReponse.data.reason);

        const ratificationResponse = await this.submissionService.send(SubmissionEndpoint.RatifySubmission, {
            submissionId: submissionId,
            playerId: playerId,
        });
        if (ratificationResponse.status === ResponseStatus.ERROR) throw ratificationResponse.error;
    }

    async rejectSubmissionByPlayer(submissionId: string, playerId: number, reason: string): Promise<void> {
        const rejectionResponse = await this.submissionService.send(SubmissionEndpoint.RejectSubmission, {
            submissionId: submissionId,
            playerId: playerId,
            reason: reason,
        });
        if (rejectionResponse.status === ResponseStatus.ERROR) throw rejectionResponse.error;
    }

    async rejectSubmissionBySystem(submissionId: string, reason: string): Promise<void> {
        return this.rejectSubmissionByPlayer(submissionId, REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID, reason);
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllSubmissionEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }
                this.redisService.getJson<ReplaySubmission>(v.payload.redisKey)
                    .then(async submission => this.pubsub.publish(submission.id, {
                        followSubmission: submission,
                    }))
                    .catch(this.logger.error.bind(this.logger));
            });
        });
    }

    async verifySubmissionUniqueness(data: CoreInput<CoreEndpoint.VerifySubmissionUniqueness>): Promise<boolean> {
        const [ {is_replay_duplicate} ] = await this.dataSource.manager.query(
            `SELECT is_replay_duplicate($1::JSONB, $2::TIMESTAMP);`,
            [JSON.stringify(data.data), data.playedAt],
        ) as Array<{is_replay_duplicate: boolean;}>;
        return !is_replay_duplicate;
    }
}
