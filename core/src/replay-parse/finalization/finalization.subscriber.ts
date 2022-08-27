import {Injectable, Logger} from "@nestjs/common";
import type {ReplaySubmission, Scrim} from "@sprocketbot/common";
import {
    EventsService,
    EventTopic,
    RedisService,
    ReplaySubmissionType,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";

import type {Match} from "../../database";
import {EloService} from "../../elo";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {MatchService} from "../../scheduling";
import {ScrimService} from "../../scrim";
import {FinalizationService} from "./finalization.service";

@Injectable()
export class FinalizationSubscriber {
    private readonly logger = new Logger(FinalizationSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly finalizationService: FinalizationService,
        private readonly submissionService: SubmissionService,
        private readonly redisService: RedisService,
        private readonly scrimService: ScrimService,
        private readonly matchService: MatchService,
        private readonly eloService: EloService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    onApplicationBootstrap(): void {
        // this.eventsService.subscribe(EventTopic.ScrimComplete, false).then(rx => {
        //     // eslint-disable-next-line @typescript-eslint/no-misused-promises
        //     rx.subscribe(async p => this.onScrimComplete(p.payload.submissionId!, p.payload));
        // })
        //     .catch(this.logger.error.bind(this.logger));

        // We want to subscribe to ratified submissions, instead of matches or scrims.
        this.eventsService.subscribe(EventTopic.SubmissionRatified, false).then(rx => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            rx.subscribe(async ({payload}) => {
                const submission = await this.redisService.getJson<ReplaySubmission>(payload.redisKey);

                if (submission.type === ReplaySubmissionType.MATCH) {
                    // Get the match???
                    const match = await this.matchService.getMatchBySubmissionId(payload.submissionId);
                    await this.onMatchSubmissionComplete(submission, payload.submissionId, match);
                } else if (submission.type === ReplaySubmissionType.SCRIM) {
                    const scrim = await this.scrimService.getScrimBySubmissionId(payload.submissionId);
                    await this.onScrimComplete(submission, payload.submissionId, scrim!);
                }
            });
        })
            .catch(this.logger.error.bind(this.logger));
    }

    onScrimComplete = async (submission: ReplaySubmission, submissionId: string, scrim: Scrim): Promise<void> => {
        try {
            if (!submission.validated) {
                this.logger.warn("Attempted to finalize scrim that did not have validated submission");
                return;
            }
            const result = await this.finalizationService.saveScrimToDatabase(submission, submissionId, scrim);
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.ScrimSaved, {
                ...scrim,
                databaseIds: {
                    id: result.scrim.id,
                    legacyId: result.legacyScrim.id,
                },
            });

            const eloPayload = this.eloService.translatePayload(result.scrim.parent, false);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, eloPayload);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };

    onMatchSubmissionComplete = async (submission: ReplaySubmission, submissionId: string, match: Match): Promise<void> => {
        const keyResponse = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (keyResponse.status === ResponseStatus.ERROR) {
            this.logger.warn(keyResponse.error.message);
            return;
        }
        try {
            const result = await this.finalizationService.saveMatchToDatabase(submission, submissionId, match);
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.MatchSaved, {
                id: result.match.id,
                legacyId: result.legacyMatch.id,
            });
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };
}
