import {Injectable} from "@nestjs/common";
import type {Scrim} from "@sprocketbot/common";
import {EventTopic, ScrimStatus} from "@sprocketbot/common";
import {v4 as uuid} from "uuid";

import {EventProxyService} from "../event-proxy/event-proxy.service";
import {GameOrderService} from "../game-order/game-order.service";
import {ScrimCrudService} from "../scrim-crud/scrim-crud.service";

@Injectable()
export class ScrimLogicService {
    constructor(
        private readonly scrimCrudService: ScrimCrudService,
        private readonly eventsService: EventProxyService,
        private readonly gameOrderService: GameOrderService,
    ) {}

    async popScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.POPPED;
        scrim.submissionGroupId = uuid();

        await this.scrimCrudService.updateScrimStatus(scrim.id, scrim.status);
        await this.scrimCrudService.setSubmissionGroupId(scrim.id, scrim.submissionGroupId);

        await this.eventsService.publish(EventTopic.ScrimPopped, scrim, scrim.id);
    }

    async startScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.IN_PROGRESS;
        scrim.games = this.gameOrderService.generateGameOrder(scrim);
        await this.scrimCrudService.setScrimGames(scrim.id, scrim.games);
        await this.scrimCrudService.updateScrimStatus(scrim.id, ScrimStatus.IN_PROGRESS);
        await this.eventsService.publish(EventTopic.ScrimStarted, scrim, scrim.id);
    }

    async deleteScrim(scrim: Scrim): Promise<void> {
        scrim.status = ScrimStatus.EMPTY;
        await this.scrimCrudService.removeScrim(scrim.id);
        await this.eventsService.publish(EventTopic.ScrimDestroyed, scrim);
    }
}
