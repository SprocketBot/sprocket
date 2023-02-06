import {Injectable} from "@nestjs/common";
import type {MatchSubmission, Scrim, ScrimSubmission} from "@sprocketbot/common";
import {
    EventPayload,
    EventsService,
    EventTopic,
    NanoidService,
    REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID,
    SprocketEvent,
    SprocketEventMarshal,
    SubmissionEndpoint,
    SubmissionService as CommonSubmissionService,
    SubmissionType,
} from "@sprocketbot/common";

import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {MatchService} from "../match/match.service";
import {ScrimService} from "../scrim/scrim.service";
import {SubmissionService} from "../submission/submission.service";
import {RocketLeagueFinalizationService} from "./rocket-league-finalization/rocket-league-finalization.service";

export const ScrimsTopic = "scrims";

@Injectable()
export class FinalizationSubscriber extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly rocketLeagueFinalizationService: RocketLeagueFinalizationService,
        private readonly commonSubmissionService: CommonSubmissionService,
        private readonly submissionService: SubmissionService,
        private readonly scrimService: ScrimService,
        private readonly matchService: MatchService,
        private readonly eloConnectorService: EloConnectorService,
        private readonly nanoidService: NanoidService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.SubmissionRatified)
    async submissionRatified(payload: EventPayload<EventTopic.SubmissionRatified>): Promise<void> {
        const submission = await this.submissionService.getSubmissionById(payload.submissionId);

        if (submission.type === SubmissionType.Match) {
            await this.onMatchRatified(submission, payload.submissionId);
        } else {
            const scrim = await this.scrimService.getScrimBySubmissionId(payload.submissionId);
            if (!scrim) throw new Error("Scrim not found");
            await this.onScrimRatified(submission, scrim);
        }
    }

    async onScrimRatified(submission: ScrimSubmission, scrim: Scrim): Promise<void> {
        try {
            if (!submission.validated) {
                this.logger.warn("Attempted to finalize scrim that did not have validated submission");
                return;
            }

            const {scrim: savedScrim, legacyScrim} = await this.rocketLeagueFinalizationService
                .finalizeScrim(submission, scrim)
                .catch(async e => {
                    const issueId = this.nanoidService.gen();
                    await this.submissionService.rejectSubmission(
                        submission.id,
                        REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID,
                        `Failed to save scrim. Please contact support with this issue id: ${issueId}`,
                    );
                    this.logger.error(`Issue saving scrim: ${issueId}`, e);
                    throw e;
                });

            // const result = await this.finalizationService.saveScrimToDatabase(submission, submissionId, scrim);
            await this.commonSubmissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId: submission.id});
            await this.eventsService.publish(EventTopic.ScrimSaved, {
                ...scrim,
                databaseIds: {
                    id: savedScrim.id,
                    legacyId: legacyScrim.id,
                },
            });

            if (!scrim.settings.competitive) return;
            const eloPayload = await this.matchService.translatePayload(savedScrim.parent.match.id, true);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, eloPayload);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    }

    async onMatchRatified(submission: MatchSubmission, submissionId: string): Promise<void> {
        try {
            const {match, legacyMatch} = await this.rocketLeagueFinalizationService
                .finalizeMatch(submission)
                .catch(async e => {
                    const issueId = this.nanoidService.gen();
                    await this.submissionService.rejectSubmission(
                        submission.id,
                        REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID,
                        `Failed to save match. Please contact support with this issue id: ${issueId}`,
                    );
                    this.logger.error(`Issue saving scrim: ${issueId}`, e);
                    throw e;
                });
            await this.commonSubmissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.MatchSaved, {
                id: match.id,
                legacyId: legacyMatch.id,
            });

            const eloPayload = await this.matchService.translatePayload(match.id, false);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, eloPayload);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    }
}
