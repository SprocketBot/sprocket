import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from '../constants';
import IORedis from 'ioredis';

@Injectable()
export class RedisJsonService {
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
  async GET() {
    throw new Error('JSON.GET not yet implemented');
  }
  async MERGE() {
    throw new Error('JSON.MERGE not yet implemented');
  }
  async MGET() {
    throw new Error('JSON.MGET not yet implemented');
  }
  async MSET() {
    throw new Error('JSON.MSET not yet implemented');
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
  async SET() {
    throw new Error('JSON.SET not yet implemented');
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
