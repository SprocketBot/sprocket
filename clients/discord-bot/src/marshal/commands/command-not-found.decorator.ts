import {MarshalMetadataKey} from "../types";

export const CommandNotFound =
    (): MethodDecorator =>
    <HookFunction>(
        // eslint-disable-next-line @typescript-eslint/ban-types
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<HookFunction>,
    ): TypedPropertyDescriptor<HookFunction> => {
        if (!descriptor.value) throw new Error("Descriptor is undefined??");
        const originalMethod: HookFunction = descriptor.value;

        // @ts-expect-error If it was not a HookFunction before, then it is using this decorator incorrectly
        descriptor.value = async function (
            // eslint-disable-next-line @typescript-eslint/ban-types
            this: Object,
            // @ts-expect-error Ignore this.
            ...params: Parameters<HookFunction>
        ): Promise<unknown> {
            /*
             * TODO: Will nest guards work, or do we need our own system?
             * If we need our own system, it should go here.
             */

            const result: unknown = await (originalMethod as HookFunction & {apply: CallableFunction}).apply(
                this,
                ...params,
            );
            return result;
        };
        const commandMetadata = {
            functionName: key.toString(),
        };
        // Check for existing metadata attached to the class
        let unsafeMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.CommandNotFound, target);
        if (!Array.isArray(unsafeMetadata)) unsafeMetadata = [];
        const classCommandMetadatas: unknown[] = unsafeMetadata as unknown[];

        // Add our metadata for this command to the class
        classCommandMetadatas.push(commandMetadata);
        Reflect.defineMetadata(MarshalMetadataKey.CommandNotFound, classCommandMetadatas, target);
        return descriptor;
    };
