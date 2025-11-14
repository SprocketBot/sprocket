import { BaseEntity, UserEntity } from '../internal';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum MetricType {
    COUNTER = 'counter',
    GAUGE = 'gauge',
    HISTOGRAM = 'histogram',
    SUMMARY = 'summary'
}

@Entity('metrics', { schema: 'sprocket' })
export class MetricsEntity extends BaseEntity {
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'decimal', precision: 20, scale: 6 })
    value: number;

    @Column({ type: 'varchar', length: 20 })
    type: MetricType;

    @Column({ type: 'varchar', length: 20, nullable: true })
    unit?: string;

    @Column({ type: 'varchar', length: 100 })
    service: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    method?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    path?: string;

    @Column({ type: 'jsonb', nullable: true })
    labels?: Record<string, string>;

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
}