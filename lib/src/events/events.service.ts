import { Injectable, Logger } from '@nestjs/common';
import { Observable, EMPTY } from 'rxjs';
import { BaseSchema, Output } from 'valibot';

export type SprocketEvent<Payload> = {
  topic: string | symbol;
  source: string | null;
  payload: Payload | null;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor() {}

  async publish(topic: string | symbol, payload: unknown): Promise<boolean> {
    this.logger.warn(`EventsService.publish called but RMQ is disabled. Topic: ${topic.toString()}`);
    return false;
  }

  async subscribe<
    SchemaType extends BaseSchema,
    Payload extends Output<SchemaType> = Output<SchemaType>,
  >(
    topic: string | symbol,
    instanceExclusive: boolean,
    schema: SchemaType,
  ): Promise<Observable<SprocketEvent<Payload>>> {
    this.logger.warn(`EventsService.subscribe called but RMQ is disabled. Topic: ${topic.toString()}`);
    return EMPTY;
  }
}
