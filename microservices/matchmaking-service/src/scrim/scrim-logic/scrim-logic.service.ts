import {InjectQueue} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import type {Scrim} from "@sprocketbot/common";
import {
    AnalyticsEndpoint, AnalyticsService, EventTopic, ScrimStatus,
} from "@sprocketbot/common";
import {Queue} from "bull";
import {v4 as uuid} from "uuid";

import {EventProxyService} from "../event-proxy/event-proxy.service";
import {GameOrderService} from "../game-order/game-order.service";
import {ScrimCrudService} from "../scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimLogicService {
    private readonly logger = new Logger(ScrimLogicService.name);

    constructor(
        private readonly scrimCrudService: ScrimCrudService,
        private readonly eventsService: EventProxyService,
        private readonly gameOrderService: GameOrderService,
        protected readonly analyticsService: AnalyticsService,
        @InjectQueue("scrim") private scrimQueue: Queue,
    ) {}

    async popScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.POPPED;
        scrim.submissionGroupId = uuid();

        const job = await this.scrimQueue.add("timeoutQueue", scrim.id, {delay: scrim.settings.checkinTimeout * 1000});

        await this.scrimCrudService.updateScrimStatus(scrim.id, scrim.status);
        await this.scrimCrudService.setSubmissionGroupId(scrim.id, scrim.submissionGroupId);
        await this.scrimCrudService.setTimeoutJobId(scrim.id, job.id);

        await this.eventsService.publish(EventTopic.ScrimPopped, scrim, scrim.id);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimPopped",
            tags: [
                ["scrimId", scrim.id],
                ["submissionGroupId", scrim.submissionGroupId],
            ],
        }).catch(err => { this.logger.error(err) });
    }

    async startScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.IN_PROGRESS;
        scrim.games = this.gameOrderService.generateGameOrder(scrim);
        await this.scrimCrudService.setScrimGames(scrim.id, scrim.games);
        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.IN_PROGRESS);
        
        if (scrim.timeoutJobId) {
            const job = await this.scrimQueue.getJob(scrim.timeoutJobId);
            await job?.remove();
        }
        
        await this.eventsService.publish(EventTopic.ScrimStarted, scrim, scrim.id);
    }

    async deleteScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.EMPTY;
        await this.scrimCrudService.removeScrim(scrim.id);
        await this.eventsService.publish(EventTopic.ScrimDestroyed, scrim);
    }
}
