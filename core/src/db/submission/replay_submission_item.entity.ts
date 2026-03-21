import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MatchSubmissionEntity } from './match_submission.entity';
import type { MatchSubmissionEntity as MatchSubmissionEntityType } from './match_submission.entity';

export enum ReplaySubmissionItemStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

@Entity('replay_submission_item', { schema: 'sprocket' })
export class ReplaySubmissionItemEntity extends BaseEntity {
  @ManyToOne(() => MatchSubmissionEntity, (submission) => submission.items, {
    onDelete: 'CASCADE',
  })
  submission: MatchSubmissionEntityType;

  @Column()
  taskId: string;

  @Column()
  originalFilename: string;

  @Column()
  inputPath: string;

  @Column({ nullable: true })
  outputPath?: string;

  @Column({
    type: 'enum',
    enum: ReplaySubmissionItemStatus,
    default: ReplaySubmissionItemStatus.PENDING,
  })
  status: ReplaySubmissionItemStatus;

  @Column({ type: 'integer', default: 0 })
  progressValue: number;

  @Column({ default: 'Queued for parsing' })
  progressMessage: string;

  @Column({ type: 'text', nullable: true })
  error?: string;
}
