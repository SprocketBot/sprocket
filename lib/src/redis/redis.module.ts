import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisJsonService } from './redis-json/redis-json.service';
import { RedisClient } from './constants';
import { SprocketConfigService } from '../config-module';
import IORedis from 'ioredis';

const clientProvider = {
  provide: RedisClient,
  inject: [SprocketConfigService],
  useFactory(cfg: SprocketConfigService) {
    return new IORedis({
      host: cfg.getOrThrow('redis.hostname'),
    });
  },
};

@Module({
  imports: [],
  providers: [clientProvider, RedisService, RedisJsonService],
  exports: [RedisService, RedisJsonService],
})
export class RedisModule {}
