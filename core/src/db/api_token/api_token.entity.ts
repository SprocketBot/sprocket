import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';
import { ApiTokenUsageLogEntity } from './api_token_usage_log.entity';
import type { ApiTokenUsageLogEntity as ApiTokenUsageLogEntityType } from './api_token_usage_log.entity';

@Entity('api_token', { schema: 'sprocket' })
export class ApiTokenEntity extends BaseEntity {
    @Column({ unique: true })
    tokenHash: string; // SHA256

    @Column({ unique: true, nullable: true })
    tokenPrefix: string;

    @Column()
    name: string;

    @Column({ type: 'text', array: true, nullable: true })
    scopes: string[];

    @Column({ nullable: true })
    expiresAt: Date;

    @Column({ nullable: true })
    lastUsedAt: Date;

    @Column({ default: 0 })
    usageCount: number;

    @Column({ default: false })
    isRevoked: boolean;

    @Column({ nullable: true })
    revokedAt: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntityType;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn()
    revokedBy: UserEntityType;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
    
    @OneToMany(() => ApiTokenUsageLogEntity, (log) => log.token)
    usageLogs: ApiTokenUsageLogEntityType[];
}
