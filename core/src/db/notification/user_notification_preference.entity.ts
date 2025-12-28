import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserEntity } from '../user/user.entity';
import { NotificationChannel } from './notification.types';

@Entity('user_notification_preference', { schema: 'sprocket' })
@Unique('user-channel-unq', ['user', 'channel'])
export class UserNotificationPreferenceEntity extends BaseEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column({ default: true })
    enabled: boolean;

    @Column('jsonb', { default: {} })
    settings: Record<string, any>;
}