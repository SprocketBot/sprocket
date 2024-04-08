import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export type MessageSpec = {
  requestData: any;
  responseData: any;
};
export type EventSpec = {
  payload: any;
};

export declare abstract class TypedClientProxy<
  MessageKeys extends string,
  EventKeys extends string,
  Messages extends MessageKeys extends never
    ? never
    : Record<MessageKeys, MessageSpec>,
  Events extends EventKeys extends never ? never : Record<EventKeys, EventSpec>,
> extends ClientProxy {
  send<Message extends keyof Messages>(
    pattern: Message,
    data: Messages[Message]['requestData'],
  ): Observable<Messages[Message]['responseData']>;
  emit<Event extends keyof Events>(
    pattern: Event,
    data: Events[Event]['payload'],
  ): Observable<Events[Event]['payload']>;
}
