import { Injectable, Logger } from '@nestjs/common';
import { RmqService } from '../rmq/rmq.service';
import { Observable, map } from 'rxjs';
import { BaseSchema, Output, safeParse } from 'valibot';

export type SprocketEvent<Payload> = {
  topic: string | symbol;
  source: string | null;
  payload: Payload | null;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(private readonly rmqService: RmqService) {}

  async publish(topic: string | symbol, payload: unknown): Promise<boolean> {
    this.logger.verbose(
      `Dispatching ${topic.toString()} with payload=${JSON.stringify(payload)}`,
    );
    const buf = Buffer.from(JSON.stringify(payload));
    return this.rmqService.pub(topic.toString(), buf);
  }

  async subscribe<
    SchemaType extends BaseSchema,
    Payload extends Output<SchemaType> = Output<SchemaType>,
  >(
    topic: string | symbol,
    instanceExclusive: boolean,
    schema: SchemaType,
  ): Promise<Observable<SprocketEvent<Payload>>> {
    const observable = await this.rmqService.sub(
      topic.toString(),
      instanceExclusive,
    );
    return observable.pipe(
      map((message) => {
        const rawValue = JSON.parse(message.content.toString()) as unknown;
        const result = safeParse(schema, rawValue);
        if (!result.success) {
          this.logger.warn(
            `Recieved invalid message on pattern ${topic.toString()}`,
            {
              issues: result.issues,
              source: message.properties.appId,
              topic: message.fields.routingKey,
              messageId: message.properties.messageId,
            },
          );
          return {
            topic: message.fields.routingKey,
            payload: null,
            source: message.properties.appId ?? null,
          };
        } else {
          this.logger.verbose(
            `Recieved message on pattern ${topic.toString()}`,
            {
              messageId: message.properties.messageId,
              source: message.properties.appId,
              topic: message.fields.routingKey,
            },
          );
          return {
            topic: message.fields.routingKey,
            payload: result.output,
            source: message.properties.appId ?? null,
          };
        }
      }),
    );
  }
}
