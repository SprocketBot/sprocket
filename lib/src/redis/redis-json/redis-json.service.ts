import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClient } from '../constants';
import IORedis from 'ioredis';

@Injectable()
export class RedisJsonService {
  private readonly logger = new Logger(RedisJsonService.name);
  constructor(@Inject(RedisClient) private readonly redis: IORedis) {}
  // TODO: Implement functions for the Redis JSON Spec https://redis.io/commands/json.mget/
  async ARRAPPEND() {
    throw new Error('JSON.ARRAPPEND not yet implemented');
  }
  async ARRINDEX() {
    throw new Error('JSON.ARRINDEX not yet implemented');
  }
  async ARRINSERT() {
    throw new Error('JSON.ARRINSERT not yet implemented');
  }
  async ARRLEN() {
    throw new Error('JSON.ARRLEN not yet implemented');
  }
  async ARRPOP() {
    throw new Error('JSON.ARRPOP not yet implemented');
  }
  async ARRTRIM() {
    throw new Error('JSON.ARRTRIM not yet implemented');
  }
  async CLEAR() {
    throw new Error('JSON.CLEAR not yet implemented');
  }
  async DEBUG() {
    throw new Error('JSON.DEBUG not yet implemented');
  }
  async DEL() {
    throw new Error('JSON.DEL not yet implemented');
  }
  async FORGET() {
    throw new Error('JSON.FORGET not yet implemented');
  }
  /**
   * @param key Key to perform GET on
   * @param paths Set of one or more JSON paths to look up
   * @returns null when key is not found, T when key is found and all paths exist.
   * @throws when one or more paths are missing
   */
  async GET<T = unknown>(key: string, ...paths: string[]): Promise<T | null> {
    this.logger.verbose(['JSON.GET', key, ...paths].join(' '));
    const result = await this.redis.call('JSON.GET', key, ...paths);
    if (!result) return null;
    return result as T;
  }

  async MERGE() {
    throw new Error('JSON.MERGE not yet implemented');
  }

  /**
   * @param path JSON Path to retrieve from each key
   * @param keys Set of Redis keys to look up
   * @returns Array of T or null depending on if the path exists on each key
   * @thows When redis returns a non-array result (this is unexpected behavior from Redis)
   */
  async MGET<T = unknown>(
    path: string,
    ...keys: string[]
  ): Promise<Array<T | null>> {
    this.logger.verbose(['JSON.MGET', ...keys, path].join(' '));
    const result = await this.redis.call('JSON.MGET', ...keys, path);
    if (!Array.isArray(result)) throw new Error(`Recieved unexpected result`);
    return result.map((item) => (item !== null ? JSON.parse(item) : null));
  }

  async MSET(...tuples: [string, string, any][]): Promise<boolean> {
    const commandTuples = tuples
      .map(([k, p, v]) => [k, p, JSON.stringify(v)])
      .flat();
    this.logger.verbose(['JSON.MSET', ...commandTuples].join(' '));

    const result = await this.redis.call('JSON.MSET', ...commandTuples);
    if (result === 'OK') return true;
    return false;
  }
  async NUMINCRBY() {
    throw new Error('JSON.NUMINCRBY not yet implemented');
  }
  async NUMMULTBY() {
    throw new Error('JSON.NUMMULTBY not yet implemented');
  }
  async OBJKEYS() {
    throw new Error('JSON.OBJKEYS not yet implemented');
  }
  async OBJLEN() {
    throw new Error('JSON.OBJLEN not yet implemented');
  }
  async RESP() {
    throw new Error('JSON.RESP not yet implemented');
  }

  async SET(
    key: string,
    path: string,
    value: any,
    mod?: 'NX' | 'XX',
  ): Promise<boolean> {
    // If mod is not provided, there needs to be no argument (not undefined)
    // So we throw everything into an array, filter it, and then spread it into the redis call
    const args = [key, path, JSON.stringify(value), mod].filter(Boolean);
    this.logger.verbose(['JSON.SET', ...args].join(' '));

    const result = await this.redis.call('JSON.SET', ...args);
    if (result === 'OK') return true;
    return false;
  }
  async STRAPPEND() {
    throw new Error('JSON.STRAPPEND not yet implemented');
  }
  async STRLEN() {
    throw new Error('JSON.STRLEN not yet implemented');
  }
  async TOGGLE() {
    throw new Error('JSON.TOGGLE not yet implemented');
  }
  async TYPE() {
    throw new Error('JSON.TYPE not yet implemented');
  }
}
