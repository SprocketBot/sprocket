import {Injectable} from "@nestjs/common";
import type {EventPayload, EventResponse} from "@sprocketbot/common";
import {EventsService, EventTopic} from "@sprocketbot/common";
import type {Observable} from "rxjs";

import {ScrimMetricsService} from "../scrim-metrics/scrim-metrics.service";

@Injectable()
/**
 * This service exists to wrap the existing Event Service exposed by Sprocket Common, but let us intercept event publishing
 * So that we can publish Scrim Metrics
 */
export class EventProxyService
implements Omit<EventsService, "rmqService" | "subscribeAsyncIterator"> {
    constructor(
        private readonly service: EventsService,
        private readonly scrimMetricsService: ScrimMetricsService,
    ) {}

    async publish<T extends EventTopic>(
        topic: T,
        payload: EventPayload<T>,
        subtopic?: string,
    ): Promise<boolean> {
        await this.service.publish(
            EventTopic.ScrimMetricsUpdate,
            await this.scrimMetricsService.getScrimMetrics(),
        );
        // TODO: On Scrim Update, Regen and republish scrim metrics
        return this.service.publish(topic, payload, subtopic);
    }

    async subscribe<T extends EventTopic>(
        topic: T,
        instanceExclusive: boolean,
        subtopic?: string,
    ): Promise<Observable<EventResponse<T>>> {
        return this.service.subscribe(topic, instanceExclusive, subtopic);
    }
}
