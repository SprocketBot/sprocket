import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import {
  BaseSprocketModules,
  EventsModule,
  SprocketConfigService,
} from '@sprocketbot/lib';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';
import { ScrimPoppedTimeoutQueue } from './jobs/scrim-popped-timeout/schema';
import { ScrimPoppedTimeoutService } from './jobs/scrim-popped-timeout/scrim-popped-timeout.service';
import { ScrimPoppedTimeoutProcessor } from './jobs/scrim-popped-timeout/scrim-popped-timeout.processor';
import { ScrimPendingTimeoutProcessor } from './jobs/scrim-pending-timeout/scrim-pending-timeout.processor';
import { ScrimPendingTimeoutService } from './jobs/scrim-pending-timeout/scrim-pending-timeout.service';
import { ScrimPendingTimeoutQueue } from './jobs/scrim-pending-timeout/schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot(),
    ...BaseSprocketModules,
    EventsModule,
    BullModule.forRootAsync({
      inject: [SprocketConfigService],
      async useFactory(config: SprocketConfigService) {
        return {
          connection: {
            host: config.getOrThrow('redis.hostname'),
            port: config.getOrThrow('redis.port'),
          },
        };
      },
    }),
    BullModule.registerQueue(
      {
        name: ScrimPoppedTimeoutQueue,
      },
      {
        name: ScrimPendingTimeoutQueue,
      },
    ),
  ],
  controllers: [AppController],
  providers: [
    ScrimCrudService,
    ScrimPoppedTimeoutService,
    ScrimPoppedTimeoutProcessor,
    ScrimPendingTimeoutService,
    ScrimPendingTimeoutProcessor,
  ],
})
export class AppModule {}
