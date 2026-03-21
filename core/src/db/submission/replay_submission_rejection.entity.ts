import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MatchSubmissionEntity } from './match_submission.entity';
import type { MatchSubmissionEntity as MatchSubmissionEntityType } from './match_submission.entity';

@Entity('replay_submission_rejection', { schema: 'sprocket' })
export class ReplaySubmissionRejectionEntity extends BaseEntity {
  @ManyToOne(() => MatchSubmissionEntity, (submission) => submission.rejections, {
    onDelete: 'CASCADE',
  })
  submission: MatchSubmissionEntityType;

  @Column()
  playerId: string;

  @Column({ nullable: true })
  playerName?: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ default: false })
  stale: boolean;
}
