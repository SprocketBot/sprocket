import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Scrim } from './scrim.entity';

@Entity('scrim_players')
export class ScrimPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Scrim, (scrim) => scrim.players, { onDelete: 'CASCADE' })
  scrim: Scrim;
}
