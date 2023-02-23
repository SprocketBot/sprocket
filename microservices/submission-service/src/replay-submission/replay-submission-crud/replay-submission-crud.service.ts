import {Injectable} from "@nestjs/common";
import type {
    MatchSubmission,
    ProgressMessage,
    ScrimSubmission,
    Submission,
    SubmissionItem,
    SubmissionRatification,
    SubmissionRatificationRound,
    SubmissionRejection,
    SubmissionStats,
    Task,
} from "@sprocketbot/common";
import {
    config,
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    OrganizationConfigurationKeyCode,
    RedisService,
    ResponseStatus,
    SCRIM_REQ_RATIFICATION_MAJORITY,
    SubmissionItemSchema,
    SubmissionRatificationSchema,
    SubmissionRejectionSchema,
    SubmissionSchema,
    SubmissionStatus,
    SubmissionType,
} from "@sprocketbot/common";
import {z} from "zod";

import {submissionIsMatch, submissionIsScrim} from "../../utils";

@Injectable()
export class ReplaySubmissionCrudService {
    private readonly prefix = `${config.redis.prefix}:submission:`;

    constructor(
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        private readonly coreService: CoreService,
    ) {}

    getSubmissionKey(submissionId: string): string {
        return `${this.prefix}${submissionId}`;
    }

    async getAllSubmissions(): Promise<Submission[]> {
        const key = this.getSubmissionKey("*");
        const submissionKeys = await this.redisService.getKeys(key);
        return Promise.all(
            submissionKeys.map(key => this.redisService.getJson<Submission>(key, undefined, SubmissionSchema)),
        );
    }

    async getSubmissionById(submissionId: string): Promise<Submission> {
        const submissionKey = `${this.prefix}${submissionId}`;
        return this.redisService.getJson<Submission>(submissionKey, undefined, SubmissionSchema);
    }

    async getSubmissionByIdIfExists(submissionId: string): Promise<Submission | null> {
        const submissionKey = `${this.prefix}${submissionId}`;
        return this.redisService.getJsonIfExists<Submission>(submissionKey, SubmissionSchema);
    }

    async getOrCreateSubmission(submissionId: string, uploaderUserId: number): Promise<Submission> {
        const submissionKey = this.getSubmissionKey(submissionId);
        const existingSubmission = await this.redisService.getJsonIfExists<Submission>(submissionKey, SubmissionSchema);

        if (existingSubmission) {
            await this.startNewRound(submissionId);
            return existingSubmission;
        } else {
            const type = submissionIsScrim(submissionId)
                ? SubmissionType.Scrim
                : submissionIsMatch(submissionId)
                ? SubmissionType.Match
                : undefined;
            if (!type) throw new Error("Unknown submission type");

            if (type === SubmissionType.Match) {
                const matchResult = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {submissionId});
                if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;

                const submission: MatchSubmission = {
                    matchId: matchResult.data.id,
                    id: submissionId,
                    type: type,
                    status: SubmissionStatus.Processing,
                    validated: false,
                    requiredRatifications: 2, // TODO Make this configurable.
                    ratifications: [],
                    rejections: [],
                    rejectionStreak: 0,
                    uploaderUserId: uploaderUserId,
                    items: [],
                    rounds: [],
                };

                await this.redisService.setJson(submissionKey, submission);
                return submission;
            } else {
                const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {
                    submissionId,
                });
                if (scrimResult.status === ResponseStatus.ERROR) throw scrimResult.error;
                if (!scrimResult.data) throw new Error("Scrim not found");

                const scrimRatificationsResult = await this.coreService.send(
                    CoreEndpoint.GetOrganizationConfigurationValue,
                    {
                        organizationId: scrimResult.data.organizationId,
                        code: OrganizationConfigurationKeyCode.SCRIM_REQUIRED_RATIFICATIONS,
                    },
                );
                if (scrimRatificationsResult.status === ResponseStatus.ERROR) throw scrimRatificationsResult.error;
                const ratConfig = scrimRatificationsResult.data as number;
                const scrimRequiredRatifications =
                    ratConfig === SCRIM_REQ_RATIFICATION_MAJORITY
                        ? scrimResult.data.players.length / 2 + 1
                        : Math.min(ratConfig, scrimResult.data.players.length);

                const submission: ScrimSubmission = {
                    scrimId: scrimResult.data.id,
                    id: submissionId,
                    type: type,
                    status: SubmissionStatus.Processing,
                    validated: false,
                    requiredRatifications: scrimRequiredRatifications,
                    ratifications: [],
                    rejections: [],
                    rejectionStreak: 0,
                    uploaderUserId: uploaderUserId,
                    items: [],
                    rounds: [],
                };

                await this.redisService.setJson(submissionKey, submission);
                return submission;
            }
        }
    }

    async getSubmissionItems(submissionId: string): Promise<SubmissionItem[]> {
        const key = this.getSubmissionKey(submissionId);
        return this.redisService.getJson<SubmissionItem[]>(key, "items", SubmissionItemSchema.array());
    }

    async getSubmissionRatifications(submissionId: string): Promise<SubmissionRatification[]> {
        const key = this.getSubmissionKey(submissionId);
        return this.redisService.getJson<SubmissionRatification[]>(
            key,
            "ratifications",
            SubmissionRatificationSchema.array(),
        );
    }

    async getSubmissionRejections(submissionId: string): Promise<SubmissionRejection[]> {
        const key = this.getSubmissionKey(submissionId);
        return this.redisService.getJson<SubmissionRejection[]>(key, "rejections", SubmissionRejectionSchema.array());
    }

    async removeSubmission(submissionId: string): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        return this.redisService.delete(key);
    }

    async updateStatus(submissionId: string, submissionStatus: SubmissionStatus): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "status", submissionStatus);
    }

    async upsertItem(submissionId: string, item: SubmissionItem): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        const existingItems = await this.redisService.getJson<SubmissionItem[]>(
            key,
            ".items",
            SubmissionItemSchema.array(),
        );

        if (existingItems.some(ei => ei.taskId === item.taskId)) {
            const updatedItem = Object.assign(existingItems.find(ei => ei.taskId === item.taskId)!, item);
            const i = existingItems.findIndex(ei => ei.taskId === item.taskId);
            await this.redisService.setJsonField(key, `items[${i}]`, updatedItem);
        } else {
            await this.redisService.appendToJsonArray(key, "items", item);
        }
    }

    async updateItemProgress(submissionId: string, progress: ProgressMessage<Task.ParseReplay>): Promise<void> {
        const items = await this.getSubmissionItems(submissionId);
        const item = items.find(i => i.taskId === progress.taskId);
        if (!item) throw new Error(`Task with id ${progress.taskId} not found for submission ${submissionId}`);

        item.progress = progress;
        await this.upsertItem(submissionId, item);
    }

    async setValidatedTrue(submissionId: string): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "validated", true);
    }

    async setStats(submissionId: string, stats: SubmissionStats): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "stats", stats);
    }

    async addRatification(submissionId: string, userId: number): Promise<SubmissionRatification> {
        const ratifications = await this.getSubmissionRatifications(submissionId);
        if (ratifications.some(r => r.userId === userId)) return ratifications.find(r => r.userId === userId)!;

        const key = this.getSubmissionKey(submissionId);
        const ratification: SubmissionRatification = {
            userId: userId,
            ratifiedAt: new Date(),
        };

        await this.redisService.appendToJsonArray(key, "ratifications", ratification);
        return ratification;
    }

    async addRejection(submissionId: string, userId: number, reason: string): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        const rejection: SubmissionRejection = {
            userId: userId,
            rejectedAt: new Date(),
            reason: reason,
        };

        await this.redisService.appendToJsonArray(key, "rejections", rejection);
    }

    async setRejectionStreak(submissionId: string, streak: number): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "rejectionStreak", streak);
    }

    async incrementRejectionStreak(submissionId: string): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        const value = await this.redisService.getJson<number>(key, "rejectionStreak", z.number());
        await this.setRejectionStreak(submissionId, value + 1);
    }

    async startNewRound(submissionId: string): Promise<void> {
        const key = this.getSubmissionKey(submissionId);
        const submission = await this.getSubmissionById(submissionId);
        const items = submission.items.map(i => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {progress, ...item} = i;
            return item;
        });
        const ratificationRound: SubmissionRatificationRound = {
            uploaderUserId: submission.uploaderUserId,
            items: items,
            ratifications: submission.ratifications,
            rejections: submission.rejections,
        };

        await this.redisService.appendToJsonArray(key, "rounds", ratificationRound);
        await this.redisService.setJsonField(key, "ratifications", []);
        await this.redisService.setJsonField(key, "rejections", []);
        await this.redisService.setJsonField(key, "items", []);
        await this.redisService.deleteJsonField(key, "stats");
        await this.redisService.setJsonField(key, "status", SubmissionStatus.Pending);
    }
}
