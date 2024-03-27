import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DbModule } from '../db/db.module';
import { RedisModule } from '@sprocketbot/lib';

@Module({
  imports: [TerminusModule, DbModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
