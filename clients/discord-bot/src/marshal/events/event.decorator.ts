import {MarshalMetadataKey} from "../types";
import type {EventMeta, EventSpec} from "./events.types";

export const Event =
    (eventSpec: EventSpec): MethodDecorator =>
    <T>(
        // eslint-disable-next-line @typescript-eslint/ban-types
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<T>,
    ): TypedPropertyDescriptor<T> => {
        if (!descriptor.value) throw new Error("Descriptor is undefined??");

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
