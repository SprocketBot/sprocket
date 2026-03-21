import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';
import { ScrimEntity } from '../scrim/scrim.entity';
import type { ScrimEntity as ScrimEntityType } from '../scrim/scrim.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';
import { ReplaySubmissionItemEntity } from './replay_submission_item.entity';
import { ReplaySubmissionRejectionEntity } from './replay_submission_rejection.entity';
import { ReplaySubmissionRatifierEntity } from './replay_submission_ratifier.entity';

export enum SubmissionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    VALIDATING = 'VALIDATING',
    RATIFYING = 'RATIFYING',
    RATIFIED = 'RATIFIED'
}

export enum ReplaySubmissionType {
    MATCH = 'MATCH',
    SCRIM = 'SCRIM',
    LFS = 'LFS',
}

@Entity('match_submission', { schema: 'sprocket' })
export class MatchSubmissionEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MatchEntity)
    match: MatchEntityType;

    @ManyToOne(() => ScrimEntity, { nullable: true })
    scrim?: ScrimEntityType;

    @ManyToOne(() => UserEntity)
    submittedBy: UserEntityType;

    @Column({ type: 'enum', enum: SubmissionStatus })
    status: SubmissionStatus;

    @Column({
        type: 'enum',
        enum: ReplaySubmissionType,
        default: ReplaySubmissionType.MATCH,
    })
    submissionType: ReplaySubmissionType;

    @Column({ type: 'jsonb' })
    submittedData: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    stats?: Record<string, any>;

    @OneToMany(() => ReplaySubmissionItemEntity, (item) => item.submission)
    items: ReplaySubmissionItemEntity[];

    @OneToMany(() => ReplaySubmissionRejectionEntity, (rej) => rej.submission)
    rejections: ReplaySubmissionRejectionEntity[];

    @OneToMany(() => ReplaySubmissionRatifierEntity, (rat) => rat.submission)
    ratifiers: ReplaySubmissionRatifierEntity[];

    @Column()
    submittedAt: Date;

    @Column({ nullable: true })
    reviewedAt: Date;

    @ManyToOne(() => UserEntity, { nullable: true })
    reviewedBy: UserEntityType;

    @Column({ nullable: true })
    rejectionReason: string;
}
