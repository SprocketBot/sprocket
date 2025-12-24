import { Module } from '@nestjs/common';
import { EventsService } from './events.service';

@Module({
  imports: [],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
