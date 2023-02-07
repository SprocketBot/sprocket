import {Injectable, Logger} from "@nestjs/common";
import type {SubmissionEndpoint, SubmissionOutput} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ResponseStatus,
    ScrimStatus,
    SubmissionStatus,
} from "@sprocketbot/common";

import {submissionIsMatch, submissionIsScrim} from "../utils";
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
        const submission = await this.submissionCrudService.getSubmissionById(submissionId);
        return submission.ratifications.length >= submission.requiredRatifications;
    }

    async canSubmitReplays(
        submissionId: string,
        userId: number,
    ): Promise<SubmissionOutput<SubmissionEndpoint.CanSubmitReplays>> {
        const submission = await this.submissionCrudService.getSubmissionByIdIfExists(submissionId);

        if (submission && ![SubmissionStatus.Pending, SubmissionStatus.Rejected].includes(submission.status)) {
            return {
                canSubmit: false,
                reason: "A submission with items already exists",
            };
        }

        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {
                submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim)
                return {
                    canSubmit: false,
                    reason: `Could not find a associated scrim`,
                };
            if (!scrim.players.some(p => p.userId === userId)) {
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
            if (!match.awayFranchise || !match.homeFranchise)
                return {
                    canSubmit: false,
                    reason: "Missing franchise information",
                };
            const {homeFranchise, awayFranchise} = match;

            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {memberId: userId});
            if (franchiseResult.status === ResponseStatus.ERROR) throw franchiseResult.error;
            const franchises = franchiseResult.data;
            const targetFranchise = franchises.find(
                f => f.name === homeFranchise.name || f.name === awayFranchise.name,
            );

            if (!targetFranchise) {
                // TODO: Check for LO Override
                this.logger.log(
                    `Player ${userId} is on ${franchises.map(f => f.name).join(", ")}, not on expected franchises ${
                        homeFranchise.name
                    }, ${awayFranchise.name}`,
                );
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
        userId: number,
    ): Promise<SubmissionOutput<SubmissionEndpoint.CanRatifySubmission>> {
        const submission = await this.submissionCrudService.getSubmissionById(submissionId);

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
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {
                submissionId,
            });
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim)
                return {
                    canRatify: false,
                    reason: `Could not find a associated scrim`,
                };
            if (!scrim.players.some(p => p.userId === userId)) {
                // TODO: Check player's organization teams (i.e. Support override)
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
            if (!match.awayFranchise || !match.homeFranchise)
                return {
                    canRatify: false,
                    reason: "Missing franchise information",
                };
            const {homeFranchise, awayFranchise} = match;

            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {memberId: userId});
            if (franchiseResult.status === ResponseStatus.ERROR) throw franchiseResult.error;
            const franchises = franchiseResult.data;
            const targetFranchise = franchises.find(
                f => f.name === homeFranchise.name || f.name === awayFranchise.name,
            );

            if (!targetFranchise) {
                // TODO: Check for LO Override
                this.logger.log(
                    `Player ${userId} is on ${franchises.map(f => f.name).join(", ")}, not on expected franchises ${
                        homeFranchise.name
                    }, ${awayFranchise.name}`,
                );
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
