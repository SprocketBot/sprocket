import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export type MessageSpec = {
  requestData: any;
  responseData: any;
};

export declare abstract class TypedClientProxy<
  MessageKeys extends string,
  EventKeys extends string,
  Messages extends MessageKeys extends never
    ? never
    : Record<MessageKeys, MessageSpec>,
  Events extends EventKeys extends never
    ? never
    : Record<EventKeys, MessageSpec>,
> extends ClientProxy {
  send<Message extends keyof Messages>(
    pattern: Message,
    data: Messages[Message]['requestData'],
  ): Observable<Messages[Message]['responseData']>;
  emit<Event extends keyof Events>(
    pattern: Event,
    data: Events[Event]['requestData'],
  ): Observable<Events[Event]['responseData']>;
}
