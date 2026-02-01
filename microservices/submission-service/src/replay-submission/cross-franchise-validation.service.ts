import {Injectable, Logger} from "@nestjs/common";
import type {
    CrossFranchiseValidationError,
    EnhancedReplaySubmission,
    FranchiseInfo,
    RatifierInfo,
} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";

@Injectable()
export class CrossFranchiseValidationService {
    private readonly logger = new Logger(CrossFranchiseValidationService.name);

    constructor(private readonly coreService: CoreService) {}

    /**
   * Validates if a player can ratify a submission based on cross-franchise rules.
   *
   * @param submission The current submission
   * @param playerId The ID of the player attempting to ratify
   * @returns A validation error if the ratification is invalid, otherwise null
   */
    async validateRatification(
        submission: EnhancedReplaySubmission,
        playerId: number,
    ): Promise<CrossFranchiseValidationError | null> {
        // For SCRIM and LFS, skip franchise validation entirely
        // Only verify that the player participated (handled by the caller)
        if (submission.type !== ReplaySubmissionType.MATCH) {
            return null;
        }

        // MATCH submissions require franchise validation
        // 1. Get player's franchise information
        const playerFranchises = await this.getPlayerFranchises(playerId);

        if (playerFranchises.length === 0) {
            return {
                code: "PLAYER_NO_FRANCHISE",
                message: "Player does not belong to any franchise.",
                context: {
                    submissionId: submission.id,
                    playerId,
                    submissionType: submission.type,
                },
            };
        }

        // 2. Apply match-specific validation logic
        return this.validateMatchRatification(submission, playerId, playerFranchises);
    }

    /**
   * Validates ratification for MATCH submissions.
   * Rule: Two unique votes from different franchises.
   */
    private validateMatchRatification(
        submission: EnhancedReplaySubmission,
        playerId: number,
        playerFranchises: FranchiseInfo[],
    ): CrossFranchiseValidationError | null {
        const existingRatifiers = submission.ratifiers;

        // Check if player has already ratified (should be handled by CRUD service but good to be safe)
        if (existingRatifiers.some(r => r.playerId === playerId)) {
            return {
                code: "ALREADY_RATIFIED",
                message: "Player has already ratified this submission.",
                context: {
                    submissionId: submission.id,
                    playerId,
                },
            };
        }

        // Get unique franchise IDs already represented in ratifiers
        const existingFranchiseIds = [...new Set(existingRatifiers.map(r => r.franchiseId))];

        // Check if any of the player's franchises are already represented
        const overlappingFranchise = playerFranchises.find(pf => existingFranchiseIds.includes(pf.id));

        if (overlappingFranchise) {
            return {
                code: "FRANCHISE_ALREADY_REPRESENTED",
                message: `Your franchise (${overlappingFranchise.name}) has already ratified this match. A different franchise must provide the second ratification.`,
                context: {
                    submissionId: submission.id,
                    playerId,
                    existingFranchises: existingFranchiseIds,
                    playerFranchises,
                    requiredFranchises: submission.franchiseValidation.requiredFranchises,
                },
            };
        }

        return null;
    }

    /**
   * Fetches franchise information for a player.
   */
    private async getPlayerFranchises(playerId: number): Promise<FranchiseInfo[]> {
        try {
            const result = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {
                userId: playerId,
            });
            if (result.status === ResponseStatus.SUCCESS) {
                return result.data.map(f => ({
                    id: f.id,
                    name: f.name,
                }));
            }
            this.logger.error(`Failed to fetch franchises for player ${playerId}: ${result.error}`);
            return [];
        } catch (error) {
            this.logger.error(`Error fetching franchises for player ${playerId}`, error);
            return [];
        }
    }
}
