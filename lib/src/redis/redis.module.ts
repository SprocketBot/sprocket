import { Logger, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisJsonService } from './redis-json/redis-json.service';
import { RedisClient } from './constants';
import { SprocketConfigService } from '../config-module';
import IORedis from 'ioredis';

const logger = new Logger(RedisClient.toString());

const clientProvider = {
  provide: RedisClient,
  inject: [SprocketConfigService],
  async useFactory(cfg: SprocketConfigService) {
    const redisCfg = {
      host: cfg.getOrThrow('redis.hostname'),
      port: cfg.getOrThrow('redis.port'),
    };
    logger.log(`Connecting to redis`, redisCfg);
    const redis = new IORedis({
      ...redisCfg,
      lazyConnect:
        true /* Defer connecting until we can await it to check the connection */,
    });

    await redis.connect();
    logger.log(`Connected`);
    return redis;
  },
};

@Module({
  imports: [],
  providers: [clientProvider, RedisService, RedisJsonService],
  exports: [RedisService, RedisJsonService],
})
export class RedisModule {}
