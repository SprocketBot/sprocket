import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export enum DataAuditAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

@Entity('data_audit_log', { schema: 'sprocket' })
export class DataAuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    actorId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'actorId' })
    actor?: UserEntity;

    @Column()
    entityName: string;

    @Column()
    entityId: string;

    @Column({ type: 'enum', enum: DataAuditAction })
    action: DataAuditAction;

    @Column({ type: 'jsonb', nullable: true })
    previousData?: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    newData?: Record<string, any>;

    @CreateDateColumn()
    timestamp: Date;
}
