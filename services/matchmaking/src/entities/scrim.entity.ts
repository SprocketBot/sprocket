import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ScrimPlayer } from './scrim-player.entity';

@Entity('scrims')
export class Scrim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'uuid' })
  skillGroupId: string;

  @Column({ type: 'uuid' })
  gameModeId: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'int' })
  maxParticipants: number;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @OneToMany(() => ScrimPlayer, (player: ScrimPlayer) => player.scrim, {
    cascade: true,
  })
  players: ScrimPlayer[];
}
