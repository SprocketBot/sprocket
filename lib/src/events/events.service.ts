import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../services/matchmaking/src/entities/event.entity';
import { Observable, from, map } from 'rxjs';
import { BaseSchema, Output, safeParse } from 'valibot';

export type SprocketEvent<Payload> = {
  topic: string | symbol;
  source: string | null;
  payload: Payload | null;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async publish(topic: string | symbol, payload: unknown): Promise<boolean> {
    this.logger.verbose(
      `Dispatching ${topic.toString()} with payload=${JSON.stringify(payload)}`,
    );
    await this.eventRepo.save({ event_type: topic.toString(), payload });
    return true;
  }

  subscribe<
    SchemaType extends BaseSchema,
    Payload extends Output<SchemaType> = Output<SchemaType>,
  >(
    topic: string | symbol,
    _instanceExclusive: boolean,
    schema: SchemaType,
  ): Observable<SprocketEvent<Payload>> {
    // Poll for new events every 2 seconds
    return new Observable<SprocketEvent<Payload>>((subscriber) => {
      const lastChecked = new Date();
      const interval = setInterval(async () => {
        const events = await this.eventRepo.find({
          where: { event_type: topic.toString(), handled: false },
          order: { created_at: 'ASC' },
        });
        for (const event of events) {
          const result = safeParse(schema, event.payload);
          if (!result.success) {
            this.logger.warn(
              `Received invalid message on pattern ${topic.toString()}`,
              {
                issues: result.issues,
                topic: event.event_type,
                eventId: event.id,
              },
            );
            subscriber.next({
              topic: event.event_type,
              payload: null,
              source: null,
            });
          } else {
            this.logger.verbose(
              `Received message on pattern ${topic.toString()}`,
              { eventId: event.id, topic: event.event_type },
            );
            subscriber.next({
              topic: event.event_type,
              payload: result.output,
              source: null,
            });
          }
          event.handled = true;
          await this.eventRepo.save(event);
        }
      }, 2000);
      return () => clearInterval(interval);
    });
  }
}
