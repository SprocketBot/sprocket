import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Scrim } from './scrim.entity';

@Entity('scrim_timeouts')
export class ScrimTimeout {
  @PrimaryColumn('uuid')
  scrim_id: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @OneToOne(() => Scrim, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scrim_id' })
  scrim: Scrim;
}
