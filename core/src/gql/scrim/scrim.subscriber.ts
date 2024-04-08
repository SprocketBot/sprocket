import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchmakingEvents, ScrimSchema } from '@sprocketbot/matchmaking';
import { EventsService } from '@sprocketbot/lib';
import { PubSubEngine } from 'graphql-subscriptions';
import { PubSubProvider } from '../constants';

@Injectable()
export class ScrimSubscriber {
  private readonly logger = new Logger(ScrimSubscriber.name);
  constructor(
    @Inject(PubSubProvider)
    private readonly pubsub: PubSubEngine,
    private readonly eventService: EventsService,
  ) {}

  async onApplicationBootstrap() {
    const rx = await this.eventService.subscribe(
      MatchmakingEvents.ScrimUpdated,
      true,
      ScrimSchema,
    );

    rx.subscribe((data) => {
      this.pubsub.publish(MatchmakingEvents.ScrimUpdated, data);
    });
  }
}
