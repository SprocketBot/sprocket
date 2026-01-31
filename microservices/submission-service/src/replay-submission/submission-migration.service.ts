import {Injectable, Logger} from "@nestjs/common";
import type {
    EnhancedReplaySubmission,
    FranchiseInfo,
    RatifierInfo,
    ReplaySubmission,
} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";

import {
    getSubmissionKey, submissionIsLFS, submissionIsMatch, submissionIsScrim,
} from "../utils";

@Injectable()
export class SubmissionMigrationService {
    private readonly logger = new Logger(SubmissionMigrationService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly coreService: CoreService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async migrateSubmissions(): Promise<void> {
        this.logger.log("Starting submission migration...");

        const submissionKeys = await this.redisService.getKeys(getSubmissionKey("*"));
        this.logger.log(`Found ${submissionKeys.length} submissions to check.`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const key of submissionKeys) {
            try {
                const submission = await this.redisService.getJson<
                ReplaySubmission | EnhancedReplaySubmission
                >(key);
                if (!submission) continue;

                if (this.isLegacy(submission)) {
                    this.logger.log(`Migrating legacy submission: ${submission.id}`);
                    await this.migrateSubmission(submission);
                    migratedCount++;
                }
            } catch (error: any) {
                this.logger.error(
                    `Failed to migrate submission at key ${key}: ${error.message}`,
                    error.stack,
                );
                errorCount++;
            }
        }

        this.logger.log(`Migration finished. Migrated: ${migratedCount}, Errors: ${errorCount}`);
    }

    private isLegacy(submission: ReplaySubmission | EnhancedReplaySubmission): submission is ReplaySubmission {
        return (
            !("franchiseValidation" in submission)
      || (submission.ratifiers.length > 0 && typeof submission.ratifiers[0] === "number")
        );
    }

    private async migrateSubmission(submission: ReplaySubmission): Promise<void> {
        const submissionId = submission.id;
        const ratifiers: RatifierInfo[] = [];

        // 1. Convert ratifiers
        for (const playerId of submission.ratifiers as unknown as number[]) {
            const franchiseInfo = await this.getFranchiseInfo(playerId);
            ratifiers.push({
                playerId,
                franchiseId: franchiseInfo?.id ?? 0,
                franchiseName: franchiseInfo?.name ?? "Unknown",
                ratifiedAt: new Date().toISOString(), // We don't have the original timestamp, so we use now
            });
        }

        // 2. Initialize franchiseValidation
        let requiredFranchises = 1;
        if (submissionIsMatch(submissionId)) {
            requiredFranchises = 2;
        }

        const uniqueFranchiseIds = new Set(ratifiers.map(r => r.franchiseId));
        const currentFranchiseCount = uniqueFranchiseIds.size;

        const enhancedSubmission: EnhancedReplaySubmission = {
            ...submission,
            ratifiers,
            franchiseValidation: {
                requiredFranchises,
                currentFranchiseCount,
            },
        } as EnhancedReplaySubmission;

        // 3. Save back to Redis
        await this.redisService.setJson(getSubmissionKey(submissionId), enhancedSubmission);
        this.logger.log(`Successfully migrated submission: ${submissionId}`);
    }

    private async getFranchiseInfo(playerId: number): Promise<FranchiseInfo | undefined> {
        const result = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {
            memberId: playerId,
        });
        if (result.status === ResponseStatus.SUCCESS && result.data.length > 0) {
            return {
                id: result.data[0].id,
                name: result.data[0].name,
            };
        }
        return undefined;
    }
}
