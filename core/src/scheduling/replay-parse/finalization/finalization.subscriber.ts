import {Injectable, Logger} from "@nestjs/common";
import type {ReplaySubmission, Scrim} from "@sprocketbot/common";
import {
    EventsService,
    EventTopic,
    RedisService, ReplaySubmissionType,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";
import {v4 as uuidv4} from "uuid";

import {EloConnectorService, EloEndpoint} from "../../../elo/elo-connector";
import {MatchService} from "../../match.service";
import {ScrimService} from "../../scrim/scrim.service";
import {ReplayParseService} from "../replay-parse.service";
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
        private readonly replayParseService: ReplayParseService,
    ) {}

    onApplicationBootstrap(): void {
        // We want to subscribe to ratified submissions, instead of matches or scrims.
        this.eventsService
            .subscribe(EventTopic.SubmissionRatified, false)
            .then(rx => {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                rx.subscribe(async ({payload}) => {
                    const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

                    if (submission.type === ReplaySubmissionType.MATCH) {
                        await this.onMatchSubmissionComplete(submission as MatchReplaySubmission, payload.submissionId);
                    } else {
                        const scrim = await this.scrimService.getScrimBySubmissionId(payload.submissionId);
                        if (!scrim) throw new Error("Scrim not found");
                        await this.onScrimComplete(submission as ScrimReplaySubmission, payload.submissionId, scrim);
                    }
                });
            })
            .catch(this.logger.error.bind(this.logger));
    }

    onScrimComplete = async (submission: ScrimReplaySubmission, submissionId: string, scrim: Scrim): Promise<void> => {
        try {
            if (!submission.validated) {
                this.logger.warn("Attempted to finalize scrim that did not have validated submission");
                return;
            }

            const {scrim: savedScrim, legacyScrim} = await this.rocketLeagueFinalizationService.finalizeScrim(submission, scrim).catch(async e => {
                const issueId = uuidv4();
                await this.replayParseService.rejectSubmissionBySystem(submission.id, `Failed to save scrim. Please contact support with this issue id: ${issueId}`);
                this.logger.error(`Issue saving scrim: ${issueId}`, e);
                throw e;
            });

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
            const eloPayload = await this.matchService.translatePayload(savedScrim.parent.match.id, true);
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
            const {match, legacyMatch} = await this.rocketLeagueFinalizationService.finalizeMatch(submission).catch(async e => {
                const issueId = uuidv4();
                await this.replayParseService.rejectSubmissionBySystem(submission.id, `Failed to save match. Please contact support with this issue id: ${issueId}`);
                this.logger.error(`Issue saving scrim: ${issueId}`, e);
                throw e;
            });
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
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
    };
}
