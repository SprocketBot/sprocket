import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { RmqModule } from '../rmq/rmq.module';

@Module({
  imports: [RmqModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
