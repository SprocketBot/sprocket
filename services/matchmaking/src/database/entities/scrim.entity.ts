import { ScrimState } from '../../constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Participant } from './participant.entity';

@Entity('scrims')
export class Scrim {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'game_id' })
  gameId: string;

  @Column({ name: 'game_mode_id' })
  gameModeId: string;

  @Column({ name: 'skill_group_id' })
  skillGroupId: string;

  @Column({ name: 'max_participants' })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: ScrimState,
    enumName: 'scrim_state',
  })
  state: ScrimState;

  @Column({ name: 'pending_ttl', type: 'bigint', nullable: true })
  pendingTtl?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Participant, (participant) => participant.scrim, {
    cascade: true,
    eager: true,
  })
  participants: Participant[];

  // Virtual field for participant count
  get participantCount(): number {
    return this.participants?.length || 0;
  }
}
