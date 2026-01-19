import { MarshalMetadataKey } from '../types';

export const CommandNotFound =
  (): MethodDecorator =>
    <T>(
      target: Object,
      key: string | symbol,
      descriptor: TypedPropertyDescriptor<T>,
    ): TypedPropertyDescriptor<T> => {
      if (!descriptor.value) throw new Error('Descriptor is undefined??');
      const originalMethod = descriptor.value as unknown as (...args: any[]) => Promise<unknown>;

      descriptor.value = (async function (
        this: Object,
        ...params: any[]
      ): Promise<unknown> {
        /*
         * TODO: Will nest guards work, or do we need our own system?
         * If we need our own system, it should go here.
         */

        const result: unknown = await (
          originalMethod as unknown as { apply: CallableFunction }
        ).apply(this, params);
        return result;
      }) as unknown as T;
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
