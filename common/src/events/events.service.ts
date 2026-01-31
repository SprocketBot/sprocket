import {Injectable, Logger} from "@nestjs/common";
import type {Observable} from "rxjs";
import {map} from "rxjs";

import type {
    EventPayload, EventResponse, EventTopic,
} from "./events.types";
import {EventSchemas, EventTopicSchema} from "./events.types";
import {RmqService} from "./rmq.service";

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);

    constructor(private readonly rmqService: RmqService) {}

    async subscribe<T extends EventTopic>(
        topic: T,
        instanceExclusive: boolean,
        subtopic: string = "*",
    ): Promise<Observable<EventResponse<T>>> {
        const rawObservable = await this.rmqService.sub(`${topic}.${subtopic}`, instanceExclusive);
        const schema = EventSchemas[topic];
        return rawObservable.pipe(map(message => {
            const rawValue = JSON.parse(message.content.toString()) as unknown;
            const value = schema.parse(rawValue);

            return {
                topic: EventTopicSchema.parse(message.fields.routingKey),
                payload: value as EventPayload<T>,
            } as EventResponse<T>;
        }));
    }

    async publish<T extends EventTopic>(
        topic: T,
        payload: EventPayload<T>,
        subtopic: string = "default",
    ): Promise<boolean> {
        EventSchemas[topic].parse(payload);

        this.logger.verbose(`Dispatching ${topic} with payload=${JSON.stringify(payload)}`);
        const buf = Buffer.from(JSON.stringify(payload));
        return this.rmqService.pub(`${topic}.${subtopic}`, buf);
    }
}
