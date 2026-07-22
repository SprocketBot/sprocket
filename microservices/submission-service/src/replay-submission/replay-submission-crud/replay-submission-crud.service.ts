import {Injectable} from "@nestjs/common";
import type {
    ProgressMessage,
    ReplaySubmission,
    ReplaySubmissionItem,
    ReplaySubmissionRejection,
    ReplaySubmissionStats,
    Task,
} from "@sprocketbot/common";
import type {
    EnhancedReplaySubmission, FranchiseInfo, RatifierInfo,
} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    OrganizationConfigurationKeyCode,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
    ResponseStatus,
    SCRIM_REQ_RATIFICATION_MAJORITY,
} from "@sprocketbot/common";

import {
    submissionIsLFS, submissionIsMatch, submissionIsScrim,
} from "../../utils";
import {ReplaySubmissionPostgresRepository} from "../persistence/replay-submission-postgres.repository";

@Injectable()
export class ReplaySubmissionCrudService {
    constructor(
        private readonly repository: ReplaySubmissionPostgresRepository,
        private readonly matchmakingService: MatchmakingService,
        private readonly coreService: CoreService,
    ) {}

    async getAllSubmissions(): Promise<ReplaySubmission[]> {
        return this.repository.findAll() as Promise<ReplaySubmission[]>;
    }

    async getSubmission(submissionId: string): Promise<ReplaySubmission | undefined> {
        return this.repository.findById(submissionId) as Promise<ReplaySubmission | undefined>;
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

    async getOrCreateSubmission(submissionId: string, playerId: number): Promise<ReplaySubmission> {
        const existingSubmission = await this.repository.findById(submissionId);
        if (existingSubmission && !existingSubmission.items.length) return existingSubmission as ReplaySubmission;

        const commonFields = {
            id: submissionId,
            creatorId: playerId,
            status: ReplaySubmissionStatus.PROCESSING,
            taskIds: [],
            items: [],
            validated: false,
            ratifiers: [],
            rejections: [],
            stats: undefined,
            requiredRatifications: 2, // NOTE Make this configurable.
        };
        let submission: any;
        let configMinRatify: number; // From the Organization config.
        let minRatify: number; // The actual minimum number of ratifiers.
        let maxRatify: number; // Total number of players.

        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(
                MatchmakingEndpoint.GetScrimBySubmissionId,
                submissionId,
            );
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) throw new Error(`Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`);
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.SCRIM,
                scrimId: scrim.id,
                franchiseValidation: {
                    requiredFranchises: 1,
                    currentFranchiseCount: 0,
                },
            };

            configMinRatify = await this.getOrgRequiredRatifications(scrim.organizationId);
            maxRatify = scrim.players.length;
        } else if (submissionIsLFS(submissionId)) {
            const result = await this.matchmakingService.send(
                MatchmakingEndpoint.GetScrimBySubmissionId,
                submissionId,
            );
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) throw new Error(`Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`);
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.LFS,
                scrimId: scrim.id,
                franchiseValidation: {
                    requiredFranchises: 1,
                    currentFranchiseCount: 0,
                },
            };

            configMinRatify = await this.getOrgRequiredRatifications(scrim.organizationId);
            maxRatify = scrim.players.length;
        } else if (submissionIsMatch(submissionId)) {
            const result = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {
                submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const match = result.data;
            if (typeof match === "undefined") throw new Error(`Unable to create submission, could not find a match associated with submissionId=${submissionId}`);
            submission = {
                ...commonFields,
                type: ReplaySubmissionType.MATCH,
                matchId: match.id,
                franchiseValidation: {
                    requiredFranchises: 2,
                    currentFranchiseCount: 0,
                },
            };

            // NOTE: Match type does not currently have player/team info or organization ID.
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

        await this.repository.saveSubmission(submission);
        return submission;
    }

    async getSubmissionItems(submissionId: string): Promise<ReplaySubmissionItem[]> {
        return this.repository.getItems(submissionId);
    }

    async getSubmissionRejections(submissionId: string): Promise<ReplaySubmissionRejection[]> {
        return this.repository.getRejections(submissionId);
    }

    async getSubmissionRatifiers(submissionId: string): Promise<number[] | RatifierInfo[]> {
        return this.repository.getRatifiers(submissionId);
    }

    async removeSubmission(submissionId: string): Promise<void> {
        return this.repository.delete(submissionId);
    }

    async removeItems(submissionId: string): Promise<void> {
        await this.repository.replaceItems(submissionId, []);
    }

    async updateStatus(
        submissionId: string,
        submissionStatus: ReplaySubmissionStatus,
    ): Promise<void> {
        await this.repository.updateStatus(submissionId, submissionStatus);
    }

    async upsertItem(submissionId: string, item: ReplaySubmissionItem): Promise<void> {
        const existingItems = await this.repository.getItems(submissionId);
        if (existingItems.some(ei => ei.taskId === item.taskId)) {
            // The task is already in the array
            const t = {
                ...existingItems.find(ei => ei.taskId === item.taskId)!,
                ...item,
            };
            await this.repository.upsertItem(submissionId, t);
        } else {
            await this.repository.upsertItem(submissionId, item);
        }
    }

    async updateItemProgress(
        submissionId: string,
        progress: ProgressMessage<Task.ParseReplay>,
    ): Promise<void> {
        const items = await this.getSubmissionItems(submissionId);
        const item = items.find(i => i.taskId === progress.taskId);
        if (!item) throw new Error(`Task with id ${progress.taskId} not found for submission ${submissionId}`);
        item.progress = progress;
        await this.upsertItem(submissionId, item);
    }

    async setValidatedTrue(submissionId: string): Promise<void> {
        await this.repository.setValidated(submissionId, true);
    }

    async setStats(submissionId: string, stats: ReplaySubmissionStats): Promise<void> {
        await this.repository.setStats(submissionId, stats);
    }

    async addRatifier(submissionId: string, userId: number): Promise<void> {
        const submission = await this.getSubmission(submissionId);
        if (!submission) throw new Error("Submission not found");

        const ratifiers = submission.ratifiers;

        // Check if player has already ratified
        const playerIds = this.getPlayerIdsFromRatifiers(ratifiers);
        if (playerIds.includes(userId)) return;

        // Only use enhanced franchise validation for MATCH submissions
        // Scrims and LFS only need to verify the player participated (handled by caller)
        if (this.isEnhanced(submission) && submission.type === ReplaySubmissionType.MATCH) {
            // Fetch franchise info for the player
            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {
                userId: userId,
            });

            if (franchiseResult.status !== ResponseStatus.SUCCESS || !franchiseResult.data || franchiseResult.data.length === 0) {
                throw new Error(`Unable to fetch franchise information for player ${userId}. Ratification requires valid franchise data.`);
            }

            const playerFranchises = franchiseResult.data;

            // For MATCH submissions, match the player's franchise to one involved in the match
            // This prevents issues where staff with multiple franchises (e.g., "FP" + real franchise)
            // would use the wrong franchise and block other staff from ratifying
            let franchise: FranchiseInfo;
            if (submission.franchiseValidation.homeFranchiseId || submission.franchiseValidation.awayFranchiseId) {
                const matchFranchiseIds = [
                    submission.franchiseValidation.homeFranchiseId,
                    submission.franchiseValidation.awayFranchiseId,
                ].filter((id): id is number => id !== undefined);

                // Find which of the player's franchises is involved in this match
                const matchingFranchise = playerFranchises.find(pf => matchFranchiseIds.includes(pf.id));

                if (!matchingFranchise) {
                    throw new Error(`Player ${userId} is not affiliated with any franchise involved in this match (match franchises: ${matchFranchiseIds.join(", ")}, player franchises: ${playerFranchises.map(f => f.id).join(", ")})`);
                }

                franchise = {
                    id: matchingFranchise.id,
                    name: matchingFranchise.name,
                };
            } else {
                // Non-match submissions or missing franchise validation - use first franchise
                franchise = {
                    id: playerFranchises[0].id,
                    name: playerFranchises[0].name,
                };
            }

            // Validate franchiseId - 0 is invalid and indicates a data issue
            if (franchise.id === 0) {
                throw new Error(`Invalid franchise ID (0) returned for player ${userId} in franchise "${franchise.name}". This indicates a core service data issue.`);
            }

            const ratifierInfo: RatifierInfo = {
                playerId: userId,
                franchiseId: franchise.id,
                franchiseName: franchise.name,
                ratifiedAt: new Date().toISOString(),
            };

            await this.repository.addEnhancedRatifier(submissionId, ratifierInfo);
        } else {
            await this.repository.addNumericRatifier(submissionId, userId);
        }
    }

    private getPlayerIdsFromRatifiers(ratifiers: number[] | RatifierInfo[]): number[] {
        if (ratifiers.length === 0) return [];
        if (typeof ratifiers[0] === "number") return ratifiers as number[];
        return (ratifiers as RatifierInfo[]).map(r => r.playerId);
    }

    private isEnhanced(submission: any): submission is EnhancedReplaySubmission {
        return "franchiseValidation" in submission;
    }

    async clearRatifiers(submissionId: string): Promise<void> {
        await this.repository.clearRatifiers(submissionId);
    }

    async expireRejections(submissionId: string): Promise<void> {
        await this.repository.expireRejections(submissionId);
    }

    async addRejection(submissionId: string, playerId: number, reason: string): Promise<void> {
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
            playerId,
            reason,
            rejectedItems,
            rejectedAt,
            stale,
        };

        await this.clearRatifiers(submissionId);
        await this.repository.addRejection(submissionId, rejection);
    }
}
