import {Injectable, Logger} from "@nestjs/common";
import type {ReplaySubmission, Scrim} from "@sprocketbot/common";
import {
    EventPayload,    EventsService,
    EventTopic,
    RedisService,    ReplaySubmissionType,
    ResponseStatus, SprocketEvent,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";

import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {MatchService} from "../../scheduling";
import {ScrimService} from "../../scrim";
import type {MatchReplaySubmission, ScrimReplaySubmission} from "../types";
import {RocketLeagueFinalizationService} from "./rocket-league/rocket-league-finalization.service";

@Injectable()
export class FinalizationSubscriber {
    private readonly logger = new Logger(FinalizationSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly rocketLeagueFinalizationService: RocketLeagueFinalizationService,
        private readonly submissionService: SubmissionService,
        private readonly redisService: RedisService,
        private readonly scrimService: ScrimService,
        private readonly matchService: MatchService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    @SprocketEvent(EventTopic.SubmissionRatified)
    async onSubmissionComplete(payload: EventPayload<EventTopic.SubmissionRatified>): Promise<void> {
        const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

        if (submission.type === ReplaySubmissionType.MATCH) {
            await this.onMatchSubmissionComplete(submission as MatchReplaySubmission, payload.submissionId);
        } else if (submission.type === ReplaySubmissionType.SCRIM) {
            const scrim = await this.scrimService.getScrimBySubmissionId(payload.submissionId);
            await this.onScrimComplete(submission as ScrimReplaySubmission, payload.submissionId, scrim!);
        }
    }

    onScrimComplete = async (submission: ScrimReplaySubmission, submissionId: string, scrim: Scrim): Promise<void> => {
        try {
            if (!submission.validated) {
                this.logger.warn("Attempted to finalize scrim that did not have validated submission");
                return;
            }
            const {scrim: savedScrim, legacyScrim} = await this.rocketLeagueFinalizationService.finalizeScrim(submission, scrim);

            // const result = await this.finalizationService.saveScrimToDatabase(submission, submissionId, scrim);
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.ScrimSaved, {
                ...scrim,
                databaseIds: {
                    id: savedScrim.id,
                    legacyId: legacyScrim.id,
                },
            });

            if (!scrim.settings.competitive) return;
            const eloPayload = this.matchService.translatePayload(savedScrim.parent, true);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, eloPayload);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };

    onMatchSubmissionComplete = async (submission: MatchReplaySubmission, submissionId: string): Promise<void> => {
        const keyResponse = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (keyResponse.status === ResponseStatus.ERROR) {
            this.logger.warn(keyResponse.error.message);
            return;
        }
        try {
            const {match, legacyMatch} = await this.rocketLeagueFinalizationService.finalizeMatch(submission);
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.MatchSaved, {
                id: match.id,
                legacyId: legacyMatch.id,
            });

            const eloPayload = this.matchService.translatePayload(match.matchParent, false);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, eloPayload);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };
}
