import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  BaseSprocketModules,
  EventsModule,
  SprocketConfigService,
} from '@sprocketbot/lib';
import { ScrimService } from './scrim/scrim.service';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';
import { BullModule } from '@nestjs/bullmq';
import { ScrimPoppedTimeoutQueue } from './jobs/scrim-popped-timeout/schema';
import { ScrimPoppedTimeoutService } from './jobs/scrim-popped-timeout/scrim-popped-timeout.service';
import { ScrimPoppedTimeoutProcessor } from './jobs/scrim-popped-timeout/scrim-popped-timeout.processor';
import { ScrimPendingTimeoutProcessor } from './jobs/scrim-pending-timeout/scrim-pending-timeout.processor';
import { ScrimPendingTimeoutService } from './jobs/scrim-pending-timeout/scrim-pending-timeout.service';
import { ScrimPendingTimeoutQueue } from './jobs/scrim-pending-timeout/schema';

@Module({
  imports: [
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
    ScrimService,
    ScrimCrudService,
    ScrimPoppedTimeoutProcessor,
    ScrimPoppedTimeoutService,
    ScrimPendingTimeoutProcessor,
    ScrimPendingTimeoutService,
  ],
})
export class AppModule {}
