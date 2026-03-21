import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MatchSubmissionEntity } from './match_submission.entity';
import type { MatchSubmissionEntity as MatchSubmissionEntityType } from './match_submission.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

@Entity('replay_submission_ratifier', { schema: 'sprocket' })
export class ReplaySubmissionRatifierEntity extends BaseEntity {
  @ManyToOne(() => MatchSubmissionEntity, (submission) => submission.ratifiers, {
    onDelete: 'CASCADE',
  })
  submission: MatchSubmissionEntityType;

  @ManyToOne(() => UserEntity, { nullable: true })
  user?: UserEntityType;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  franchiseId?: string;

  @Column({ nullable: true })
  franchiseName?: string;

  @Column()
  ratifiedAt: Date;
}
