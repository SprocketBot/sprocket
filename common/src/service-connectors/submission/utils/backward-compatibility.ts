import type {EnhancedReplaySubmission} from "../types/enhanced-replay-submission";
import type {FranchiseInfo} from "../types/franchise-validation";
import type {RatifierInfo} from "../types/ratifier-info";
import type {ReplaySubmission} from "../types/replay-submission";

/**
 * Utility functions for backward compatibility between old and new submission formats
 */

/**
 * Convert legacy ratifiers array (number[]) to enhanced RatifierInfo[]
 * This is a placeholder function that would need to be implemented with actual franchise lookup logic
 */
export async function convertLegacyRatifiers(
    legacyRatifiers: number[],
    submissionId: string,
    franchiseLookup: (playerId: number) => Promise<FranchiseInfo | null>,
): Promise<RatifierInfo[]> {
    return Promise.all(legacyRatifiers.map(async (playerId, index) => {
        const franchise = await franchiseLookup(playerId);
        const offset = (legacyRatifiers.length - index) * 1000;
        return {
            playerId: playerId,
            franchiseId: franchise?.id ?? 0,
            franchiseName: franchise?.name ?? "Unknown",
            ratifiedAt: new Date(Date.now() - offset).toISOString(),
        };
    }));
}

/**
 * Convert legacy submission to enhanced format
 */
export async function convertLegacySubmission(
    legacySubmission: ReplaySubmission,
    franchiseLookup: (playerId: number) => Promise<FranchiseInfo | null>,
): Promise<EnhancedReplaySubmission> {
    const enhancedRatifiers = await convertLegacyRatifiers(
        legacySubmission.ratifiers,
        legacySubmission.id,
        franchiseLookup,
    );

    const baseEnhanced = {
        ...legacySubmission,
        ratifiers: enhancedRatifiers,
        franchiseValidation: {
            requiredFranchises: 2, // Default for matches
            currentFranchiseCount: new Set(enhancedRatifiers.map(r => r.franchiseId)).size,
        },
    };

    // Add franchise-specific context based on submission type
    if (legacySubmission.type === "MATCH") {
        return {
            ...baseEnhanced,
            type: legacySubmission.type,
            matchId: legacySubmission.matchId,
        } as EnhancedReplaySubmission;
    } else if (legacySubmission.type === "SCRIM") {
        return {
            ...baseEnhanced,
            type: legacySubmission.type,
            scrimId: legacySubmission.scrimId,
        } as EnhancedReplaySubmission;
    }
    return {
        ...baseEnhanced,
        type: legacySubmission.type,
        scrimId: legacySubmission.scrimId,
    } as EnhancedReplaySubmission;

}

/**
 * Check if a submission is in enhanced format
 */
export function isEnhancedSubmission(submission: ReplaySubmission | EnhancedReplaySubmission): submission is EnhancedReplaySubmission {
    return (
        "franchiseValidation" in submission
        && Array.isArray(submission.ratifiers)
        && submission.ratifiers.length > 0
        && typeof submission.ratifiers[0] === "object"
        && "franchiseId" in submission.ratifiers[0]
    );
}

/**
 * Extract player IDs from ratifiers (works with both legacy and enhanced formats)
 */
export function getPlayerIdsFromRatifiers(ratifiers: number[] | RatifierInfo[]): number[] {
    if (ratifiers.length === 0) return [];

    if (typeof ratifiers[0] === "number") {
        return ratifiers as number[];
    }
    return (ratifiers as RatifierInfo[]).map(r => r.playerId);

}

/**
 * Get unique franchise IDs from ratifiers
 */
export function getUniqueFranchiseIds(ratifiers: RatifierInfo[]): number[] {
    return [...new Set(ratifiers.map(r => r.franchiseId))];
}

/**
 * Check if franchise validation is complete
 */
export function isFranchiseValidationComplete(
    requiredFranchises: number,
    currentFranchiseCount: number,
): boolean {
    return currentFranchiseCount >= requiredFranchises;
}

/**
 * Create a compatibility wrapper for legacy services
 */
export function createCompatibilityWrapper<T extends ReplaySubmission | EnhancedReplaySubmission>(submission: T): T extends EnhancedReplaySubmission ? EnhancedReplaySubmission : ReplaySubmission {
    return submission as unknown as (T extends EnhancedReplaySubmission ? EnhancedReplaySubmission : ReplaySubmission);
}
