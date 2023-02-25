import {z} from "zod";

import type {EventPayload} from "../events.types";
import {EventTopic} from "../events.types";

export type EventFunction<Event extends EventTopic> = (data: EventPayload<Event>) => void | Promise<void>;

export const EventMetaSchema = z.object({
    functionName: z.string(),
    event: z.nativeEnum(EventTopic),
    instanceExclusive: z.boolean(),
});

export type EventMeta = z.infer<typeof EventMetaSchema>;
