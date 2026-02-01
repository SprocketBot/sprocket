import {Injectable, Logger} from "@nestjs/common";
import type {CanRatifySubmissionResponse, ICanSubmitReplays_Response} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ResponseStatus,
    ScrimStatus,
} from "@sprocketbot/common";

import {
    submissionIsLFS, submissionIsMatch, submissionIsScrim,
} from "../utils";
import {ReplaySubmissionCrudService} from "./replay-submission-crud/replay-submission-crud.service";

@Injectable()
export class ReplaySubmissionUtilService {
    private readonly logger = new Logger(ReplaySubmissionUtilService.name);

    constructor(
        private readonly submissionCrudService: ReplaySubmissionCrudService,
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        private readonly coreService: CoreService,
    ) {}

    async isRatified(submissionId: string): Promise<boolean> {
        const submission = await this.submissionCrudService.getSubmission(submissionId);
        if (!submission) throw new Error(`No submission ${submissionId}`);
        return submission.ratifiers.length >= submission.requiredRatifications;
    }

    async canSubmitReplays(
        submissionId: string,
        memberId: number,
        userId: number,
        override?: boolean,
    ): Promise<ICanSubmitReplays_Response> {
        const submission = await this.submissionCrudService.getSubmission(submissionId);

        if (submission?.items.length) {
            return {
                canSubmit: false,
                reason: "A submission with items already exists",
            };
        }

        if (submissionIsLFS(submissionId) || submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(
                MatchmakingEndpoint.GetScrimBySubmissionId,
                submissionId,
            );
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) return {
                canSubmit: false,
                reason: `Could not find a associated scrim`,
            };
            if (
                submissionIsScrim(submissionId)
        && !scrim.players.some(p => p.id === userId)
        && !override
            ) {
                // TODO: Check player's organization teams (i.e. Support override)
                return {
                    canSubmit: false,
                    reason: `Player not in scrim.`,
                };
            }
            if (scrim.status !== ScrimStatus.IN_PROGRESS) {
                return {
                    canSubmit: false,
                    reason: "Scrim must be in progress.",
                };
            }
        } else if (submissionIsMatch(submissionId)) {
            const result = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {
                submissionId: submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const match = result.data;
            if (!match.awayFranchise || !match.homeFranchise) return {
                canSubmit: false,
                reason: "Missing franchise information",
            };
            const {homeFranchise, awayFranchise} = match;

            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {
                userId: memberId,
            });
            if (franchiseResult.status === ResponseStatus.ERROR) throw franchiseResult.error;
            const franchises = franchiseResult.data;
            const targetFranchise = franchises.find(f => f.name === homeFranchise.name || f.name === awayFranchise.name);

            if (!targetFranchise) {
                // TODO: Check for LO Override
                this.logger.log(`Player ${memberId} is on ${franchises
                    .map(f => f.name)
                    .join(", ")}, not on expected franchises ${homeFranchise.name}, ${awayFranchise.name}`);
                return {
                    canSubmit: false,
                    reason: "You are not on the correct franchise",
                };
            }

            if (!targetFranchise.staffPositions.length) {
                return {
                    canSubmit: false,
                    reason: `You are not allowed to submit for ${targetFranchise.name}`,
                };
            }
            return {
                canSubmit: true,
            };
        } else {
            return {
                canSubmit: false,
                reason: "Unable to identify submission type",
            };
        }

        return {canSubmit: true};
    }

    async canRatifySubmission(
        submissionId: string,
        memberId: number,
        userId: number,
    ): Promise<CanRatifySubmissionResponse> {
        const submission = await this.submissionCrudService.getSubmission(submissionId);

        if (!submission) {
            return {
                canRatify: false,
                reason: "The submission does not exist",
            };
        }

        if (!submission.validated) {
            return {
                canRatify: false,
                reason: "The submission has not been validated",
            };
        }

        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(
                MatchmakingEndpoint.GetScrimBySubmissionId,
                submissionId,
            );
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) return {
                canRatify: false,
                reason: `Could not find a associated scrim`,
            };
            if (!scrim.players.some(p => p.id === userId)) {
                // TODO: Check player's organization teams (i.e. Support
                // override)
                // TODO: This is very obviously incorrect: core still creates a
                // scrim (and allows players to join it) with the *USER* ID, and
                // not the player ID.
                return {
                    canRatify: false,
                    reason: `Player not in scrim.`,
                };
            }
            if (scrim.status !== ScrimStatus.IN_PROGRESS) {
                return {
                    canRatify: false,
                    reason: "Scrim must be in progress.",
                };
            }
        } else if (submissionIsMatch(submissionId)) {
            const result = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {
                submissionId: submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const match = result.data;
            if (!match.awayFranchise || !match.homeFranchise) return {
                canRatify: false,
                reason: "Missing franchise information",
            };
            const {homeFranchise, awayFranchise} = match;

            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {
                userId: memberId,
            });
            if (franchiseResult.status === ResponseStatus.ERROR) throw franchiseResult.error;
            const franchises = franchiseResult.data;
            const targetFranchise = franchises.find(f => f.name === homeFranchise.name || f.name === awayFranchise.name);

            if (!targetFranchise) {
                // TODO: Check for LO Override
                this.logger.log(`Player ${memberId} is on ${franchises
                    .map(f => f.name)
                    .join(", ")}, not on expected franchises ${homeFranchise.name}, ${awayFranchise.name}`);
                return {
                    canRatify: false,
                    reason: "You are not on the correct franchise",
                };
            }

            if (!targetFranchise.staffPositions.length) {
                return {
                    canRatify: false,
                    reason: `You are not allowed to submit for ${targetFranchise.name}`,
                };
            }

            return {
                canRatify: true,
            };
        } else {
            return {
                canRatify: false,
                reason: "Unable to identify submission type",
            };
        }

        return {canRatify: true};
    }
}
