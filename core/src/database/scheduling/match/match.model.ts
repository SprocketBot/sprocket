import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { MatchParent } from '$db/scheduling/match_parent/match_parent.model';

import { BaseModel } from '../../base-model';
import { GameSkillGroup } from '../../franchise/game_skill_group/game_skill_group.model';
import { GameMode } from '../../game/game_mode/game_mode.model';
import { Invalidation } from '../invalidation/invalidation.model';
import { Round } from '../round/round.model';

export type MatchSubmissionStatus = 'submitting' | 'ratifying' | 'completed';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class Match extends BaseModel {
  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  isDummy: boolean;

  @OneToOne(() => Invalidation, { nullable: true })
  @JoinColumn()
  @Field(() => Invalidation, { nullable: true })
  invalidation?: Invalidation;

  // TODO: Nullable, so that we can save cross-group matches?
  @ManyToOne(() => GameSkillGroup)
  @JoinColumn()
  @Field(() => GameSkillGroup)
  skillGroup: GameSkillGroup;

  @Column()
  skillGroupId: number;

  @OneToMany(() => Round, r => r.match)
  @Field(() => [Round])
  rounds: Round[];

  @OneToOne(() => MatchParent, mp => mp.match)
  @JoinColumn()
  @Field(() => MatchParent)
  matchParent: MatchParent;

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  submissionId?: string;

  @Field(() => String)
  submissionStatus: MatchSubmissionStatus;

  @Field(() => Boolean)
  canSubmit: boolean;

  @Field(() => Boolean)
  canRatify: boolean;

  /**
   * This has been made nullable in case future use-cases involve multiple game modes in a single match.
   * For Rocket League (and pre-mledb transition), we probably want to always have this; hence the non-nullable type
   */
  @ManyToOne(() => GameMode, { nullable: true })
  @Field(() => GameMode, { nullable: true })
  gameMode: GameMode;
}
