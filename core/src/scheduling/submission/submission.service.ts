import {Injectable, Logger} from "@nestjs/common";
import type {Submission} from "@sprocketbot/common";
import {
    config,
    MinioService,
    readToBuffer,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService as CommonSubmissionService,
} from "@sprocketbot/common";
import {SHA256} from "crypto-js";
import type {Readable} from "stream";

const REPLAY_EXT = ".replay";

@Injectable()
export class SubmissionService {
    private readonly logger = new Logger(SubmissionService.name);

    constructor(
        private readonly submissionService: CommonSubmissionService,
        private readonly minioService: MinioService,
    ) {}

    async getSubmissionById(submissionId: string): Promise<Submission> {
        const result = await this.submissionService.send(SubmissionEndpoint.GetSubmissionIfExists, submissionId);

        if (result.status === ResponseStatus.ERROR) throw result.error;
        if (!result.data.submission) throw new Error("Submission not found");
        return result.data.submission;
    }

    async getAllSubmissions(): Promise<Submission[]> {
        const result = await this.submissionService.send(SubmissionEndpoint.GetAllSubmissions, undefined);

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data;
    }

    async userCanSubmit(userId: number, submissionId: string): Promise<boolean> {
        const result = await this.submissionService.send(SubmissionEndpoint.CanSubmitReplays, {
            userId: userId,
            submissionId: submissionId,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data.canSubmit;
    }

    async userCanRatify(userId: number, submissionId: string): Promise<boolean> {
        const result = await this.submissionService.send(SubmissionEndpoint.CanRatifySubmission, {
            userId: userId,
            submissionId: submissionId,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data.canRatify;
    }

    async resetSubmission(submissionId: string, userId: number, override = false): Promise<boolean> {
        const result = await this.submissionService.send(SubmissionEndpoint.ResetSubmission, {
            submissionId,
            override,
            userId,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data;
    }

    async parseReplays(
        streams: Array<{stream: Readable; filename: string}>,
        submissionId: string,
        userId: number,
    ): Promise<string[]> {
        const filepaths = await Promise.all(
            streams.map(async s => {
                const buffer = await readToBuffer(s.stream);
                const objectHash = SHA256(buffer.toString()).toString();
                const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;
                const bucket = config.minio.bucketNames.replays;
                await this.minioService.put(bucket, replayObjectPath, buffer).catch(this.logger.error.bind(this));

                return {
                    minioPath: replayObjectPath,
                    originalFilename: s.filename,
                };
            }),
        );

        const submissionResponse = await this.submissionService.send(SubmissionEndpoint.SubmitReplays, {
            submissionId: submissionId,
            filepaths: filepaths,
            uploaderUserId: userId,
        });

        if (submissionResponse.status === ResponseStatus.ERROR) throw submissionResponse.error;
        return submissionResponse.data;
    }

    async ratifySubmission(submissionId: string, userId: number): Promise<true> {
        const result = await this.submissionService.send(SubmissionEndpoint.RatifySubmission, {
            submissionId: submissionId,
            userId: userId,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data;
    }

    async rejectSubmission(submissionId: string, userId: number, reason: string): Promise<true> {
        const result = await this.submissionService.send(SubmissionEndpoint.RejectSubmission, {
            submissionId: submissionId,
            userId: userId,
            reason: reason,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data;
    }
}
