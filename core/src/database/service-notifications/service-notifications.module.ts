import { Module } from '@nestjs/common';

import { GlobalEntitySubscriberService } from './global-entity-subscriber/global-entity-subscriber.service';

@Module({
  providers: [GlobalEntitySubscriberService],
})
export class ServiceNotificationsModule {}
