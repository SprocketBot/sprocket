import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { UserNotificationPreferenceEntity } from '../../db/notification/user_notification_preference.entity';
import { NotificationChannel } from '../../db/notification/notification.types';
import { UserObject } from '../user/user.object';

@ObjectType('UserNotificationPreference')
export class UserNotificationPreferenceObject extends BaseObject {
    @Field(() => UserObject)
    user: UserObject;

    @Field(() => NotificationChannel)
    channel: NotificationChannel;

    @Field()
    enabled: boolean;

    @Field(() => String, { defaultValue: '{}' })
    settings: string;
}
