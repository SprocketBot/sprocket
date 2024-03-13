import { Inject, Injectable } from '@nestjs/common';
import { SprocketConfigService } from '../config-module';
import IORedis from 'ioredis';
import Redlock from 'redlock';
import { RedisClient } from './constants';

@Injectable()
export class RedisService {
  private readonly _redlock: Redlock;

  get redlock() {
    return this._redlock;
  }
  constructor(
    private readonly cfg: SprocketConfigService,
    @Inject(RedisClient) private readonly redis: IORedis,
  ) {
    this._redlock = new Redlock([this.redis]);
  }

  async get(key: string | symbol): Promise<string | null> {
    const result = await this.redis.get(key.toString());
    if (!result) return null;
    return result;
  }
}
