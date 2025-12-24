import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import { NotificationChannel } from '../../db/notification/notification.types';

@ObjectType('NotificationTemplate')
export class NotificationTemplateObject extends BaseObject {
    @Field()
    name: string;

    @Field(() => NotificationChannel)
    channel: NotificationChannel;

    @Field()
    content: string;

    @Field(() => String, { defaultValue: '{}' })
    defaultData: string;
}
