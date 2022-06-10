import {Injectable} from "@nestjs/common";
import type {
    BaseReplaySubmission,
    ProgressMessage,     ReplaySubmission, ReplaySubmissionItem, ReplaySubmissionRejection,
    ScrimReplaySubmission,
    Task,
} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
    MatchmakingEndpoint, MatchmakingService, RedisService,
    ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";
import type {
    ReplaySubmissionStats,
} from "@sprocketbot/core/dist/replay-parse/replay-submission/types/submission-stats.types";

import {
    getSubmissionKey, submissionIsMatch, submissionIsScrim,
} from "../utils";

@Injectable()
export class ReplaySubmissionCrudService {
    constructor(
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        private readonly eventService: EventsService,
    ) {}

    async getSubmission(submissionId: string): Promise<ReplaySubmission | undefined> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.getJson<ReplaySubmission | undefined>(key);
    }

    async getOrCreateSubmission(submissionId: string, playerId: number): Promise<ReplaySubmission> {
        const key = getSubmissionKey(submissionId);
        const existingSubmission = await this.redisService.getIfExists<ReplaySubmission>(key);
        if (existingSubmission && !existingSubmission.items.length) return existingSubmission;

        const commonFields: BaseReplaySubmission = {
            creatorId: playerId,
            taskIds: [],
            items: [],
            validated: false,
            ratifiers: [],
            rejections: [],
            stats: undefined,
            requiredRatifications: 2, // TODO Make this configurable.
        };
        let submission: ReplaySubmission;
        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) throw new Error(`Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`);
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.SCRIM,
                scrimId: scrim.id,
            } as ScrimReplaySubmission;
        } else if (submissionIsMatch(submissionId)) {
            throw new Error("Creating submissions for matches is not yet supported");
        } else {
            throw new Error("Unable to identify submission type.");
        }

        await this.redisService.setJson(key, submission);
        return submission;
    }

    async getSubmissionItems(submissionId: string): Promise<ReplaySubmissionItem[]> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.getJson<ReplaySubmissionItem[]>(key, "items");
    }

    async getSubmissionRejections(submissionId: string): Promise<ReplaySubmissionRejection[]> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.getJson<ReplaySubmissionRejection[]>(key, "rejections");
    }

    async getSubmissionRatifiers(submissionId: string): Promise<number[]> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.getJson<number[]>(key, "ratifiers");
    }

    async removeSubmission(submissionId: string): Promise<void> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.delete(key);
    }

    async upsertItem(submissionId: string, item: ReplaySubmissionItem): Promise<void> {
        const key = getSubmissionKey(submissionId);

        const existingItems = await this.redisService.getJson<ReplaySubmissionItem[] | undefined>(key, ".items");
        if (existingItems?.some(ei => ei.taskId === item.taskId)) {
            // The task is already in the array
            const t = {
                ...existingItems.find(ei => ei.taskId === item.taskId)!,
                ...item,
            };
            const i = existingItems.findIndex(ei => ei.taskId === item.taskId);
            await this.redisService.setJsonField(key, `items[${i}]`, t);
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
        const key = getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "validated", true);
    }

    async setStats(submissionId: string, stats: ReplaySubmissionStats): Promise<void> {
        const key = getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "stats", stats);
    }

    // TODO: Do these need to live somewhere else? They do more than just crud
    async addRatifier(submissionId: string, playerId: number): Promise<void> {
        const ratifiers = await this.getSubmissionRatifiers(submissionId);

        // Players cannot ratify a scrim twice
        if (ratifiers.includes(playerId)) return;

        const key = getSubmissionKey(submissionId);
        await this.redisService.appendToJsonArray(key, "ratifiers", playerId);

        await this.eventService.publish(EventTopic.SubmissionRatificationAdded, {
            currentRatifications: ratifiers.length + 1,
            requiredRatifications: await this.getSubmission(submissionId).then(s => s?.requiredRatifications ?? 1),
            submissionId: submissionId,
        });
    }

    async addRejection(submissionId: string, playerId: number, reason: string): Promise<void> {
        const key = getSubmissionKey(submissionId);
        const rejectedAt = new Date().toISOString();

        const fullItems = await this.getSubmissionItems(submissionId);
        const rejectedItems = fullItems.map(item => {
            // Remove progress from copied objects
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {progress, ...rejectedItem} = item;
            return rejectedItem;
        });

        const rejection = {
            playerId, reason, rejectedItems, rejectedAt,
        };

        await this.redisService.appendToJsonArray(key, "rejections", rejection);

        await this.eventService.publish(EventTopic.SubmissionRejectionAdded, {
            submissionId: submissionId,
        });
    }

}
