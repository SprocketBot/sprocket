import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'mledb_bridge' })
export class PlayerToPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  mledPlayerId: number;

  @Column({ type: 'int' })
  sprocketPlayerId: number;
}
