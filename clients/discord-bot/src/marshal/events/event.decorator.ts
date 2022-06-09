import {Logger} from "@nestjs/common";

import type {Marshal} from "../marshal";
import {MarshalMetadataKey} from "../types";
import type {
    EventFunction, EventMeta, EventSpec,
} from "./events.types";

const logger = new Logger("EventDecorator");
export const Event = (eventSpec: EventSpec): MethodDecorator => <T>(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> => {
    if (!descriptor.value) throw new Error("Descriptor is undefined??");

    // <  Decorator>
    const originalMethod: EventFunction = descriptor.value as unknown as EventFunction;

    // @t22s-expect-error If it was not a CommandFunction before, then it is using this decorator incorrectly
    // descriptor.value = async function(this: Marshal, ...params: Parameters<EventFunction>): Promise<unknown> {
        
    // };
    // </ Decorator>

    // <Metadata>
    const eventMeta: EventMeta = {
        spec: eventSpec,
        functionName: key.toString(),
    };
    // Check for existing metadata attached to the class
    let unsafeMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.Event, target);
    if (!Array.isArray(unsafeMetadata)) unsafeMetadata = [];
    const classEventMetadatas: unknown[] = unsafeMetadata as unknown[];

    // Add our metadata for this command to the class
    classEventMetadatas.push(eventMeta);
    Reflect.defineMetadata(MarshalMetadataKey.Event, classEventMetadatas, target);
    // </ Metadata>
    return descriptor;
};
