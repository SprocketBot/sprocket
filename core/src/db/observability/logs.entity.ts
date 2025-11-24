import { BaseEntity, UserEntity } from '../internal';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace'
}

@Entity('logs', { schema: 'sprocket' })
export class LogsEntity extends BaseEntity {
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column({ type: 'varchar', length: 10 })
    level: LogLevel;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    context?: string;

    @Column({ type: 'varchar', length: 100 })
    service: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    method?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    path?: string;

    @Column({ type: 'integer', nullable: true })
    statusCode?: number;

    @Column({ type: 'integer', nullable: true })
    duration?: number;

    @Column({ type: 'text', nullable: true })
    error?: string;

    @Column({ type: 'text', nullable: true })
    trace?: string;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user?: UserEntity;

    @Column({ type: 'uuid', nullable: true })
    userId?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    requestId?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    traceId?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    spanId?: string;

    @Column({ type: 'jsonb', nullable: true })
    tags?: Record<string, any>;
}