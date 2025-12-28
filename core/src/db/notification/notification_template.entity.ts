import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { NotificationChannel } from './notification.types';

@Entity('notification_template', { schema: 'sprocket' })
export class NotificationTemplateEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column('text')
    content: string;

    @Column('jsonb', { default: {} })
    defaultData: Record<string, any>;
}