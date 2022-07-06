import {Injectable, Logger} from "@nestjs/common";
import type {ICanSubmitReplays_Response} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    RedisService,
    ResponseStatus,
    ScrimStatus,
} from "@sprocketbot/common";

import {submissionIsMatch, submissionIsScrim} from "../utils";
import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";

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

    async canSubmitReplays(submissionId: string, playerId: number): Promise<ICanSubmitReplays_Response> {
        const submission = await this.submissionCrudService.getSubmission(submissionId);

        if (submission?.items.length) {
            return {
                canSubmit: false,
                reason: "A submission with items already exists",
            };
        }

        if (submissionIsScrim(submissionId)) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) return {
                canSubmit: false,
                reason:
                  `Could not find a associated scrim`,
            };
            if (!scrim.players.some(p => p.id === playerId)) {
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
            const result = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {submissionId: submissionId});
            if (result.status === ResponseStatus.ERROR) throw result.error;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const match = result.data;
            if (!match.awayFranchise || !match.homeFranchise) return {
                canSubmit: false,
                reason: "Missing franchise information",
            };
            const {homeFranchise, awayFranchise} = match;

            const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, {memberId: playerId});
            if (franchiseResult.status === ResponseStatus.ERROR) throw franchiseResult.error;
            const franchises = franchiseResult.data;
            const targetFranchise = franchises.find(f => f.name === homeFranchise.name || f.name === awayFranchise.name);

            if (!targetFranchise) {
                // TODO: Check for LO Override
                this.logger.log(`Player ${playerId} is on ${franchises.map(f => f.name).join(", ")}, not on expected franchises ${homeFranchise.name}, ${awayFranchise.name}`);
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
}
