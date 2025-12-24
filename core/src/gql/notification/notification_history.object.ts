import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationTemplateObject } from './notification_template.object';
import { UserObject } from '../user/user.object';

@ObjectType('NotificationHistory')
export class NotificationHistoryObject extends BaseObject {
    @Field(() => NotificationChannel)
    channel: NotificationChannel;

    @Field()
    recipientId: string;

    @Field(() => NotificationStatus)
    status: NotificationStatus;

    @Field()
    templateName: string;

    @Field(() => String, { defaultValue: '{}' })
    templateData: string;

    @Field({ nullable: true })
    errorMessage?: string;

    @Field(() => Int)
    retryCount: number;

    @Field({ nullable: true })
    sentAt?: Date;

    @Field(() => NotificationTemplateObject, { nullable: true })
    template?: NotificationTemplateObject;

    @Field(() => UserObject, { nullable: true })
    user?: UserObject;
}
