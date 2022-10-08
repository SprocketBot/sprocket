import type {EventTopic} from "../events.types";
import type {SprocketEventMarshal} from "./marshal";
import {EventMarshalMetadataKey} from "./marshal.constants";
import type {EventFunction, EventMeta} from "./marshal.types";

// eslint-disable-next-line @typescript-eslint/ban-types
export const SprocketEvent =
    (event: EventTopic): MethodDecorator =>
    <T>(
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<T>,
    ): TypedPropertyDescriptor<T> => {
        if (!descriptor.value) throw new Error("Descriptor is undefined??");

        const originalMethod: EventFunction<EventTopic> =
            descriptor.value as unknown as EventFunction<EventTopic>;

        // @ts-expect-error If it was not a func before, then it is using this decorator incorrectly
        descriptor.value = async function (
            this: SprocketEventMarshal,
            ...params: Parameters<EventFunction<EventTopic>>
        ): Promise<unknown> {
            await originalMethod.apply(this, params);
        };

        const eventMeta: EventMeta = {
            functionName: key.toString(),
            event: event,
        };

        let unsafeMetadata: unknown = Reflect.getMetadata(
            EventMarshalMetadataKey,
            target,
        );
        if (!Array.isArray(unsafeMetadata)) unsafeMetadata = [];

        const classEventMetadatas: unknown[] = unsafeMetadata as unknown[];

        classEventMetadatas.push(eventMeta);
        Reflect.defineMetadata(
            EventMarshalMetadataKey,
            classEventMetadatas,
            target,
        );

        return descriptor;
    };
