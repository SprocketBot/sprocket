import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, MatchEntity, UserEntity } from '../internal';

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
    match: MatchEntity;

    @ManyToOne(() => UserEntity)
    submittedBy: UserEntity;

    @Column({ type: 'enum', enum: SubmissionStatus })
    status: SubmissionStatus;

    @Column({ type: 'jsonb' })
    submittedData: Record<string, any>;

    @Column()
    submittedAt: Date;

    @Column({ nullable: true })
    reviewedAt: Date;

    @ManyToOne(() => UserEntity, { nullable: true })
    reviewedBy: UserEntity;

    @Column({ nullable: true })
    rejectionReason: string;
}