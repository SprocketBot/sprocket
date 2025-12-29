import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export enum SubmissionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    VALIDATING = 'VALIDATING',
    RATIFYING = 'RATIFYING',
    RATIFIED = 'RATIFIED'
}

@Entity('match_submission', { schema: 'sprocket' })
export class MatchSubmissionEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MatchEntity)
    match: MatchEntityType;

    @ManyToOne(() => UserEntity)
    submittedBy: UserEntityType;

    @Column({ type: 'enum', enum: SubmissionStatus })
    status: SubmissionStatus;

    @Column({ type: 'jsonb' })
    submittedData: Record<string, any>;

    @Column()
    submittedAt: Date;

    @Column({ nullable: true })
    reviewedAt: Date;

    @ManyToOne(() => UserEntity, { nullable: true })
    reviewedBy: UserEntityType;

    @Column({ nullable: true })
    rejectionReason: string;
}