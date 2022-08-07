import {Injectable, Logger} from "@nestjs/common";
import type {Scrim} from "@sprocketbot/common";
import {
    EventsService,
    EventTopic,
    RedisService,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";

import type {Match} from "../../database";
import {EloConnectorService} from "../../elo-connector/";
import type {ReplaySubmission} from "../types";
import {FinalizationService} from "./finalization.service";

@Injectable()
export class FinalizationSubscriber {
    private readonly logger = new Logger(FinalizationSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly finalizationService: FinalizationService,
        private readonly submissionService: SubmissionService,
        private readonly redisService: RedisService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    onApplicationBootstrap(): void {
        this.eventsService.subscribe(EventTopic.ScrimComplete, false).then(rx => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            rx.subscribe(async p => this.onScrimComplete(p.payload.submissionId!, p.payload));
        })
            .catch(this.logger.error.bind(this.logger));
    }

    onScrimComplete = async (submissionId: string, scrim: Scrim): Promise<void> => {
        const keyResponse = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (keyResponse.status === ResponseStatus.ERROR) {
            this.logger.warn(keyResponse.error.message);
            return;
        }
        try {
            const submission = await this.redisService.getJson<ReplaySubmission>(keyResponse.data.redisKey);
            const savedScrims = await this.finalizationService.saveScrimToDatabase(submission, submissionId, scrim);
            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            await this.eventsService.publish(EventTopic.ScrimSaved, {
                ...scrim,
                databaseIds: {
                    id: savedScrims.scrim.id,
                    legacyId: savedScrims.legacyScrim.id,
                },
            });
            
            const eloPayload = this.eloConnectorService.translatePayload(savedScrims.scrim.parent, false);
            await this.eloConnectorService.runEloForSeries(eloPayload, false);
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };

    onMatchSubmissionComplete = async (submissionId: string, match: Match): Promise<void> => {
        const keyResponse = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (keyResponse.status === ResponseStatus.ERROR) {
            this.logger.warn(keyResponse.error.message);
            return;
        }
        try {
            const submission = await this.redisService.getJson<ReplaySubmission>(keyResponse.data.redisKey);
            // Prevent "unused" linting errors
            this.logger.verbose({match, submission});
            // TODO: Save Match to Database
            // const ids = await this.finalizationService.saveScrimToDatabase(submission, submissionId, scrim);

            await this.submissionService.send(SubmissionEndpoint.RemoveSubmission, {submissionId});
            // TODO: MatchSaved
            // await this.eventsService.publish(EventTopic.ScrimSaved, {
            //     ...scrim,
            //     databaseIds: ids,
            // });
        } catch (_e) {
            const e = _e as Error;
            this.logger.warn(e.message, e.stack);
        }
    };
}
