import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../internal';
import { NotificationChannel, NotificationStatus } from './notification.types';
import { NotificationTemplateEntity } from './notification_template.entity';

@Entity('notification_history', { schema: 'sprocket' })
export class NotificationHistoryEntity extends BaseEntity {
    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column()
    recipientId: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus;

    @Column()
    templateName: string;

    @Column('jsonb', { default: {} })
    templateData: Record<string, any>;

    @Column({ nullable: true })
    errorMessage?: string;

    @Column({ default: 0 })
    retryCount: number;

    @Column({ nullable: true })
    sentAt?: Date;

    @ManyToOne(() => NotificationTemplateEntity, { nullable: true })
    @JoinColumn()
    template?: NotificationTemplateEntity;
}