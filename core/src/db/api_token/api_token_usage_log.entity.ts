import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiTokenEntity } from '../api_token/api_token.entity';
import type { ApiTokenEntity as ApiTokenEntityType } from '../api_token/api_token.entity';

@Entity('api_token_usage_log', { schema: 'sprocket' })
export class ApiTokenUsageLogEntity extends BaseEntity {
    @ManyToOne(() => ApiTokenEntity, (token) => token.usageLogs)
    @JoinColumn()
    token: ApiTokenEntityType;

    @Column()
    endpoint: string;

    @Column()
    method: string;

    @Column({ type: 'int' })
    statusCode: number;

    @Column()
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ type: 'boolean', default: false })
    wasBlocked: boolean;
}
