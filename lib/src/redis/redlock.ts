import { Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import opentelemetry, { type Span } from '@opentelemetry/api';
import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage<RedLockAls>();
type RedLockAls = {
  lockedKeysets: string[][];
};

export const redlock = async <T>(
  redis: RedisService,
  keys: string[],
  fn: (span: Span) => Promise<T> | T,
  spanName?: string,
): Promise<T> => {
  const locker = redis.redlock;
  const tracer = opentelemetry.trace.getTracer('');
  const activeSpan = opentelemetry.trace.getActiveSpan();

  let store: undefined | RedLockAls = als.getStore();
  if (!store) {
    store = {
      // TODO: Check more into how redlock handles locking multiple resources
      // e.g. if locking a user and a scrim, are those unique locks, or a composite?
      // if unique, this behavior needs to change, where this lockedKeysets can become a
      // set of individual keys, which would be faster and easier to work with
      lockedKeysets: [],
    };
    als.enterWith(store);
    // only rename the span if it is the root
    if (spanName && activeSpan) activeSpan.updateName(spanName);
  }
  const sortedKeys = keys.sort((a, b) => a.localeCompare(b));
  if (
    store.lockedKeysets.some(
      (lockedKey) => JSON.stringify(lockedKey) === JSON.stringify(sortedKeys),
    )
  ) {
    return tracer.startActiveSpan('NestedRedLock', async (lockSpan) => {
      logger.verbose(
        `Already have a lock for ${JSON.stringify(sortedKeys)}, running without a new lock`,
      );
      lockSpan.setAttribute('keys', keys);
      try {
        return await fn(lockSpan);
      } catch (e) {
        lockSpan.recordException(e);
        throw e;
      } finally {
        lockSpan.end();
      }
    });
  } else {
    store.lockedKeysets.push(sortedKeys);
    return tracer.startActiveSpan('RedLocked', async (lockSpan) => {
      lockSpan.setAttribute('keys', keys);
      const lock = await locker.acquire(keys, 5000);

      logger.verbose(
        `Aquired lock for ${JSON.stringify(keys)} (${lock.value})`,
      );
      try {
        const result = await fn(lockSpan);
        return result;
      } catch (e) {
        lockSpan.recordException(e);
        throw e;
      } finally {
        // Remove from locked keyset when we are done
        // We do this before actually releasing the lock
        // to ensure that we don't accidentally run something
        // outside of an expected lock
        store.lockedKeysets = store.lockedKeysets.filter(
          (lockedKey) =>
            JSON.stringify(lockedKey) !== JSON.stringify(sortedKeys),
        );
        await lock.release();
        logger.verbose(
          `Released lock for ${JSON.stringify(keys)} (${lock.value})`,
        );
        lockSpan?.end();
      }
    });
  }
};
const logger = new Logger(redlock.name);
