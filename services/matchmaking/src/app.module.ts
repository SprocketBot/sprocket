import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  BaseSprocketModules,
  EventsModule,
  SprocketConfigService,
} from '@sprocketbot/lib';
import { ScrimService } from './scrim/scrim.service';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';
import { ScrimPendingTimeoutService } from './jobs/scrim-pending-timeout/scrim-pending-timeout.service';

@Module({
  imports: [
    ...BaseSprocketModules,
    EventsModule,
    // BullMQ and Redis removed
  ],
  controllers: [AppController],
  providers: [
    ScrimService,
    ScrimCrudService,
    ScrimPendingTimeoutService,
  ],
})
export class AppModule {}
