import {Injectable, Logger} from "@nestjs/common";
import {z} from "zod";

import {EventsService} from "../events.service";
import type {EventResponse, EventTopic} from "../events.types";
import {EventSchemas} from "../events.types";
import {EventMarshalMetadataKey} from "./marshal.constants";
import type {EventFunction} from "./marshal.types";
import {EventMetaSchema} from "./marshal.types";

@Injectable()
export abstract class SprocketEventMarshal {
    readonly logger = new Logger(SprocketEventMarshal.name);

    constructor(readonly eventsService: EventsService) {}

    async onApplicationBootstrap(): Promise<void> {
        const marshalMetadata: unknown = Reflect.getMetadata(EventMarshalMetadataKey, this);
        if (!marshalMetadata) return;
        const parseResult = z.array(EventMetaSchema).safeParse(marshalMetadata);
        if (!parseResult.success) {
            this.logger.error(parseResult);
            return;
        }
        const {data} = parseResult;

        data.forEach(meta => {
            const eventFunction = (Reflect.get(this, meta.functionName) as CallableFunction).bind(
                this,
            ) as EventFunction<EventTopic>;

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.eventsService.subscribe(meta.event, false).then(obs => {
                obs.subscribe((p: EventResponse<EventTopic>) => {
                    if (p.topic !== meta.event) return;

                    const payload = EventSchemas[meta.event].safeParse(p.payload);

                    if (!payload.success) {
                        this.logger.error(payload);
                        return;
                    }

                    try {
                        const executed = eventFunction(payload.data);

                        if (executed instanceof Promise)
                            executed.catch(e => {
                                this.logger.error(e);
                            });
                    } catch (e) {
                        this.logger.error(e);
                    }
                });
            });

            this.logger.debug(`Registered event ${meta.event}`);
        });
    }
}
