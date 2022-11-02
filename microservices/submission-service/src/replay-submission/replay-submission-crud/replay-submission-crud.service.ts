import {Injectable} from "@nestjs/common";
import type {
    BaseReplaySubmission,
    ProgressMessage,
    ReplaySubmission,
    ReplaySubmissionItem,
    ReplaySubmissionRejection,
    ReplaySubmissionStats,
    ScrimReplaySubmission,
    Task,
} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    OrganizationConfigurationKeyCode,
    RedisService,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
    ResponseStatus,
    SCRIM_REQ_RATIFICATION_MAJORITY,
} from "@sprocketbot/common";

import {getSubmissionKey, submissionIsMatch, submissionIsScrim} from "../../utils";

@Injectable()
export class ReplaySubmissionCrudService {
    constructor(
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        private readonly coreService: CoreService,
    ) {}

    async getAllSubmissions(): Promise<ReplaySubmission[]> {
        // Use wildcard for submissionId to list all matching keys
        const submissionKeys = await this.redisService.getKeys(getSubmissionKey("*"));
        const submissions = await Promise.all(
            submissionKeys.map<Promise<ReplaySubmission>>(async key =>
                this.redisService.getJson<ReplaySubmission>(key),
            ),
        );
        return submissions;
    }

    async getSubmission(submissionId: string): Promise<ReplaySubmission | undefined> {
        const key = getSubmissionKey(submissionId);
        return this.redisService.getJson<ReplaySubmission | undefined>(key);
    }

    async getOrgRequiredRatifications(organizationId: number): Promise<number> {
        const result = await this.coreService.send(CoreEndpoint.GetOrganizationConfigurationValue, {
            organizationId: organizationId,
            code: OrganizationConfigurationKeyCode.SCRIM_REQUIRED_RATIFICATIONS,
        });

        if (result.status === ResponseStatus.ERROR) throw result.error;
        const requiredRatifications = result.data as number;

        return requiredRatifications;
    }

    async getOrCreateSubmission(submissionId: string, userId: number): Promise<ReplaySubmission> {
        const key = getSubmissionKey(submissionId);
        const existingSubmission = await this.redisService.getJsonIfExists<ReplaySubmission>(key);
        if (existingSubmission && !existingSubmission.items.length) return existingSubmission;

        const commonFields: BaseReplaySubmission = {
            id: submissionId,
            creatorUserId: userId,
            status: ReplaySubmissionStatus.PROCESSING,
            taskIds: [],
            items: [],
            validated: false,
            ratifiers: [],
            rejections: [],
            stats: undefined,
            requiredRatifications: 2, // TODO Make this configurable.
        };
        let submission: ReplaySubmission;
        let configMinRatify: number; // From the Organization config.
        let minRatify: number; // The actual minimum number of ratifiers.
        let maxRatify: number; // Total number of players.

        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {
                submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim)
                throw new Error(
                    `Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`,
                );
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.SCRIM,
                scrimId: scrim.id,
            } as ScrimReplaySubmission;

            configMinRatify = await this.getOrgRequiredRatifications(scrim.organizationId);
            maxRatify = scrim.players.length;
        } else if (submissionIsMatch(submissionId)) {
            const result = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {submissionId});
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const match = result.data;
            if (typeof match === "undefined")
                throw new Error(
                    `Unable to create submission, could not find a match associated with submissionId=${submissionId}`,
                );
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.MATCH,
                matchId: match.id,
            };

            // TODO: Match type does not currently have player/team info or organization ID.
            //       This is currently being hardcoded to 2 to avoid changing existing behavior.
            configMinRatify = 2;
            maxRatify = configMinRatify;
        } else {
            throw new Error("Unable to identify submission type.");
        }

        if (configMinRatify === SCRIM_REQ_RATIFICATION_MAJORITY) {
            // The submission is configured to require a majority of ratifiers.
            minRatify = maxRatify / 2 + 1;
        } else {
            // Simply take the configured amount, capped to the number of players.
            minRatify = Math.min(configMinRatify, maxRatify);
        }
        submission.requiredRatifications = minRatify;

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

    async removeItems(submissionId: string): Promise<void> {
        await this.redisService.setJsonField(getSubmissionKey(submissionId), "items", []);
    }

    async updateStatus(submissionId: string, submissionStatus: ReplaySubmissionStatus): Promise<void> {
        await this.redisService.setJsonField(getSubmissionKey(submissionId), "status", submissionStatus);
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

    async addRatifier(submissionId: string, userId: number): Promise<void> {
        const ratifiers = await this.getSubmissionRatifiers(submissionId);

        // Players cannot ratify a scrim twice
        if (ratifiers.includes(userId)) return;

        await this.redisService.appendToJsonArray(getSubmissionKey(submissionId), "ratifiers", userId);
    }

    async clearRatifiers(submissionId: string): Promise<void> {
        const key = getSubmissionKey(submissionId);
        await this.redisService.setJsonField(key, "ratifiers", []);
    }

    async expireRejections(submissionId: string): Promise<void> {
        const key = getSubmissionKey(submissionId);
        // We need to make sure this array exists, otherwise multipathing breaks
        const len = (await this.redisService.redis.send_command("JSON.ARRLEN", key, "rejections")) as number;
        if (len) {
            await this.redisService.setJsonField(key, `rejections..stale`, true);
        }
    }

    async addRejection(submissionId: string, userId: number, reason: string): Promise<void> {
        const key = getSubmissionKey(submissionId);
        const rejectedAt = new Date().toISOString();

        const fullItems = await this.getSubmissionItems(submissionId);
        const rejectedItems = fullItems.map(item => {
            // Remove progress from copied objects
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {progress, ...rejectedItem} = item;
            return rejectedItem;
        });

        const stale = false;
        const rejection: ReplaySubmissionRejection = {
            userId,
            reason,
            rejectedItems,
            rejectedAt,
            stale,
        };

        await this.clearRatifiers(submissionId);
        await this.redisService.appendToJsonArray(key, "rejections", rejection);
    }
}
