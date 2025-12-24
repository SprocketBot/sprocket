import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { EventQueue, EventStatus, EventTarget, EventType } from '../../db/events/event_queue.entity';

registerEnumType(EventType, { name: 'EventType' });
registerEnumType(EventStatus, { name: 'EventStatus' });
registerEnumType(EventTarget, { name: 'EventTarget' });

@ObjectType('EventQueue')
export class EventQueueObject extends BaseObject {
    @Field(() => EventType)
    eventType: EventType;

    @Field(() => String, { defaultValue: '{}' })
    payload: string;

    @Field({ nullable: true })
    processedAt?: Date;

    @Field(() => EventStatus)
    status: EventStatus;

    @Field(() => Int)
    retryCount: number;

    @Field(() => EventTarget)
    targetService: EventTarget;
}
