import { Inject, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redlock from 'redlock';
import {
  FunctionProperty,
  Resolvable,
  ParamsIfFunction,
  DecoratorReturn,
} from '../../types';
import opentelemetry from '@opentelemetry/api';
import { redlock } from './redlock';

const redisKey = Symbol('redisService');

export const RedLock = <
  // Class containing the method to decorate
  TargetClass extends InstanceType<{ new (...args: any[]): any }>,
  // Property (key) that is being decorated
  TargetProperty extends
    keyof FunctionProperty<TargetClass> = keyof FunctionProperty<TargetClass>,
  // Property (value) that is being decorated, should be a function
  TargetValue extends TargetClass[TargetProperty] = TargetClass[TargetProperty],
>(
  ...keys: Array<
    Resolvable<
      // Can be literal, or function that returns literal
      string | symbol, // resolves to string or symbol
      ParamsIfFunction<TargetValue>, // Argument signature of the resolve function. Will accept the same parameters as the decorated function
      TargetClass
    >
  >
): DecoratorReturn<TargetClass, TargetProperty> => {
  // Get a redis injector
  const injectRedis = Inject(RedisService);

  // Actual decoration logic
  const innerFunc = function (
    this: TargetClass,
    target: TargetClass,
    propertyKey: TargetProperty,
    descriptor: TypedPropertyDescriptor<TargetValue>,
  ) {
    // If we are not describing a function, break
    if (typeof descriptor.value !== 'function') {
      throw new Error('Expected RedLock to decorate a function');
    }

    // Inject redis into the containing class
    injectRedis(target, redisKey);

    // Reference the actual function
    const originalFunction = descriptor.value;

    descriptor.value = async function (
      this: TargetClass & { [redisKey]: RedisService },
      ...args: ParamsIfFunction<TargetValue>
    ) {
      const resolvedKeys: string[] = (
        await Promise.all(
          keys.map((k) =>
            typeof k === 'function' ? k.call(this, ...args) : k,
          ),
        )
      ).map((v) => v.toString());

      return redlock(
        this[redisKey],
        resolvedKeys,
        () => originalFunction.apply(this, args),
        propertyKey?.toString(),
      );
    } as TargetValue;
  };

  return innerFunc as DecoratorReturn<TargetClass, TargetProperty>;
};

const logger = new Logger(RedLock.name);
