import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  BaseSprocketModules,
  EventsModule,
} from '@sprocketbot/lib';
import { ScrimService } from './scrim/scrim.service';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';
import { TimeoutService } from './timeout/timeout.service';

@Module({
  imports: [
    ...BaseSprocketModules,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    ScrimService,
    ScrimCrudService,
    TimeoutService,
  ],
})
export class AppModule { }
