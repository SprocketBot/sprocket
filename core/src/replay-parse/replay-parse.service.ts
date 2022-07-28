import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import type {ScrimPlayer} from "@sprocketbot/common";
import {
    config,
    EventsService,
    EventTopic,
    MinioService,
    readToBuffer,
    RedisService,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {SHA256} from "crypto-js";
import {GraphQLError} from "graphql";
import type {Readable} from "stream";

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
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {
    }

    async getSubmission(submissionId: string): Promise<ReplaySubmission> {
        const result = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (result.status === ResponseStatus.ERROR) throw result.error;

        // Right now, this is entirely based on faith. If we enounter issues; we can update the graphql types.
        // Writing up a zod schema set for this would be suckage to the 10th degree.
        return this.redisService.getJson<ReplaySubmission>(result.data.redisKey);

    }

    /**
     * @returns if the scrim has been reset
     */
    async resetBrokenReplays(submissionId: string, playerId: number): Promise<boolean> {
        const resetResponse = await this.submissionService.send(SubmissionEndpoint.ResetSubmission, {
            submissionId: submissionId,
            override: false,
            playerId: playerId.toString(),
        });
        if (resetResponse.status === ResponseStatus.ERROR) throw resetResponse.error;
        return true;
    }

    async parseReplays(streams: Array<{stream: Readable; filename: string;}>, submissionId: string, player: ScrimPlayer): Promise<string[]> {
        const canSubmitReponse = await this.submissionService.send(SubmissionEndpoint.CanSubmitReplays, {
            playerId: player.id,
            submissionId: submissionId,
        });
        if (canSubmitReponse.status === ResponseStatus.ERROR) throw canSubmitReponse.error;
        if (!canSubmitReponse.data.canSubmit) throw new GraphQLError(canSubmitReponse.data.reason);

        const filepaths = await Promise.all(streams.map(async s => {
            const buffer = await readToBuffer(s.stream);
            const objectHash = SHA256(buffer.toString()).toString();
            const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;
            await this.minioService.put(config.minio.bucketNames.replays, replayObjectPath, buffer);
            return {
                minioPath: replayObjectPath,
                originalFilename: s.filename,
            };
        }));

        const submissionResponse = await this.submissionService.send(SubmissionEndpoint.SubmitReplays, {
            submissionId: submissionId,
            filepaths: filepaths,
            creatorId: player.id,
        });
        if (submissionResponse.status === ResponseStatus.ERROR) throw submissionResponse.error;
        // Return taskIds, directly correspond to the files that were uploaded
        return submissionResponse.data;
    }

    async ratifySubmission(submissionId: string, playerId: string): Promise<void> {
        const ratificationResponse = await this.submissionService.send(SubmissionEndpoint.RatifySubmission, {
            submissionId: submissionId,
            playerId: playerId,
        });
        if (ratificationResponse.status === ResponseStatus.ERROR) throw ratificationResponse.error;
    }

    async rejectSubmission(submissionId: string, playerId: string, reason: string): Promise<void> {
        const rejectionResponse = await this.submissionService.send(SubmissionEndpoint.RejectSubmission, {
            submissionId: submissionId,
            playerId: playerId,
            reason: reason,
        });
        if (rejectionResponse.status === ResponseStatus.ERROR) throw rejectionResponse.error;
    }

    async enableSubscription(submissionId: string): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllSubmissionEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }
                this.redisService.getJson<ReplaySubmission>(v.payload.redisKey)
                    .then(async submission => this.pubsub.publish(submissionId, {
                        followSubmission: submission,
                    }))
                    .catch(this.logger.error.bind(this.logger));
            });
        });
    }
}
