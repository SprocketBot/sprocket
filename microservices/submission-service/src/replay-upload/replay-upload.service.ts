import {Injectable} from "@nestjs/common";
import type {ICanSubmitReplays_Response, ReplaySubmission} from "@sprocketbot/common";
import {
    MatchmakingEndpoint, MatchmakingService, RedisService, ResponseStatus, ScrimStatus,
} from "@sprocketbot/common";

import {REDIS_PREFIX} from "../submission.constants";

@Injectable()
export class ReplayUploadService {
    constructor(
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async canSubmitReplays(submissionId: string, playerId: number): Promise<ICanSubmitReplays_Response> {
        const submissionKey = `${REDIS_PREFIX}:${submissionId}`;
        const submission = await this.redisService.getIfExists<ReplaySubmission>(submissionKey);

        if (submission?.items.length) {
            return {
                canSubmit: false,
                reason: "A submission with items already exists",
            };
        }

        if (submissionId.startsWith("scrim")) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) return {
                canSubmit: false,
                reason:
                  `Could not find a associated scrim`,
            };
            // TODO: How does an admin override this?
            if (!scrim.players.some(p => p.id === playerId)) {
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
        } else if (submissionId.startsWith("match)")) {
            return {
                canSubmit: false,
                reason: "Match submissions not yet supported.",
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
