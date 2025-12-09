import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base.entity';

export enum EventType {
    MATCH_COMPLETED = 'MATCH_COMPLETED',
    PLAYER_JOINED_QUEUE = 'PLAYER_JOINED_QUEUE',
    SUBMISSION_CREATED = 'SUBMISSION_CREATED',
}

export enum EventStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED',
}

export enum EventTarget {
    NOTIFICATIONS = 'NOTIFICATIONS',
    IMAGE_GEN = 'IMAGE_GEN',
    REPLAY_PARSE = 'REPLAY_PARSE',
}

@Entity()
export class EventQueue extends BaseEntity {
    @Column({ type: 'enum', enum: EventType })
    eventType: EventType;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @Column({ nullable: true })
    processedAt: Date;

    @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PENDING })
    status: EventStatus;

    @Column({ default: 0 })
    retryCount: number;

    @Column({ type: 'enum', enum: EventTarget })
    targetService: EventTarget;
}